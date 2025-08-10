const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

function normalizeUrl(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// GitHub API endpoint
app.get('/api/github/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Fetch GitHub profile
    const profileResponse = await axios.get(`https://api.github.com/users/${username}`);
    const profile = profileResponse.data;
    
    // Fetch public repositories (limit to 100)
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    const repos = reposResponse.data;

    // Try to fetch declared social accounts (best-effort)
    let socialAccounts = [];
    try {
      const socialResp = await axios.get(`https://api.github.com/users/${username}/social_accounts`);
      if (Array.isArray(socialResp.data)) socialAccounts = socialResp.data;
    } catch (_) {
      // ignore if not available
    }
    
    // Calculate metrics
    const publicReposCount = profile.public_repos;
    const followers = profile.followers;
    const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const score = (followers * 2) + (publicReposCount * 1.5) + totalStars;
    
    // Format repository data
    const formattedRepos = repos.map(repo => ({
      name: repo.name,
      stars: repo.stargazers_count || 0,
      language: repo.language || 'Not specified'
    }));

    // Compose social links
    const linksSet = new Map();
    const addLink = (label, url) => {
      if (!url) return;
      const normalized = label.toLowerCase() === 'email' ? url : normalizeUrl(url);
      if (!normalized) return;
      if (!linksSet.has(normalized)) linksSet.set(normalized, { label, url: normalized });
    };

    addLink('GitHub', profile.html_url);
    addLink('Website', profile.blog);
    if (profile.twitter_username) addLink('Twitter', `https://twitter.com/${profile.twitter_username}`);
    if (profile.email) addLink('Email', `mailto:${profile.email}`);

    for (const acc of socialAccounts) {
      if (acc && acc.url && acc.provider) {
        const providerLabel = acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1);
        addLink(providerLabel, acc.url);
      }
    }

    const socialLinks = Array.from(linksSet.values());
    
    // Return formatted response
    const result = {
      username: profile.login,
      name: profile.name || profile.login,
      avatar_url: profile.avatar_url,
      followers,
      publicReposCount,
      totalStars,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      repos: formattedRepos,
      socialLinks
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching GitHub data:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'FilterFast Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 FilterFast Backend running on http://localhost:${PORT}`);
  console.log(`📊 GitHub API endpoint: http://localhost:${PORT}/api/github/:username`);
});
