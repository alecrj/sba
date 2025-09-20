// Test GitHub API connection
const { Octokit } = require("@octokit/rest");

exports.handler = async (event, _context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    console.log('Testing GitHub API connection...');
    
    // Initialize Octokit
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Get repository info from environment
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH || 'main';

    console.log(`Testing connection to: ${owner}/${repo} on branch ${branch}`);

    if (!owner || !repo) {
      throw new Error('GitHub repository information not configured');
    }

    // Test: Get repository info
    const repoInfo = await octokit.rest.repos.get({
      owner,
      repo
    });

    console.log('Repository found:', repoInfo.data.name);

    // Test: Create a test file
    const testContent = `---
title: "GitHub API Test"
date: "${new Date().toISOString()}"
---

This is a test file created by the GitHub API.
`;

    const testFilePath = `test-github-${Date.now()}.md`;
    
    const createResult = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: testFilePath,
      message: `Test GitHub API connection - ${new Date().toISOString()}`,
      content: Buffer.from(testContent).toString('base64'),
      branch
    });

    console.log('Test file created successfully:', createResult.data.content.path);

    // Clean up: Delete the test file
    await octokit.rest.repos.deleteFile({
      owner,
      repo,
      path: testFilePath,
      message: 'Clean up test file',
      sha: createResult.data.content.sha,
      branch
    });

    console.log('Test file cleaned up successfully');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        message: 'GitHub API test successful',
        repository: `${owner}/${repo}`,
        branch: branch
      })
    };

  } catch (error) {
    console.error('GitHub API test failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'GitHub API test failed',
        error: error.message,
        stack: error.stack
      })
    };
  }
};