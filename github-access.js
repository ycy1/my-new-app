/**
 * 手动发布
 */

// Set NODE_TLS_REJECT_UNAUTHORIZED to bypass SSL certificate verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Test script to verify GitHub token and repository access
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

// Get GitHub token from environment variables
const githubToken = process.env.GITHUB_TOKEN;
const owner = 'ycy1';
const repo = 'my-new-app';

if (!githubToken) {
  console.error('GitHub token not found in environment variables');
  process.exit(1);
}

// Create Octokit instance with the token
const octokit = new Octokit({
  auth: githubToken,
  request: {
    agent: new (require('https').Agent)({
      rejectUnauthorized: false // Temporarily bypass SSL verification
    })
  }
});

// Test repository access
async function testRepositoryAccess() {
  try {
    console.log('Testing GitHub token and repository access...');
    console.log(`Repository: ${owner}/${repo}`);
    
    // Try to get repository info
    const repoInfo = await octokit.repos.get({
      owner,
      repo
    });
    
    console.log('Successfully accessed repository:', repoInfo.data.full_name);
    console.log('Repository description:', repoInfo.data.description);
    console.log('GitHub API Rate Limit:', repoInfo.headers['x-ratelimit-remaining'] + '/' + repoInfo.headers['x-ratelimit-limit']);
    
    // Try to list releases
    console.log('\nListing existing releases:');
    const releases = await octokit.repos.listReleases({
      owner,
      repo
    });
    
    if (releases.data.length === 0) {
      console.log('No releases found in the repository.');
    } else {
      console.log(`Found ${releases.data.length} release(s):`);
      releases.data.forEach(release => {
        console.log(`- ${release.name || release.tag_name} (${release.draft ? 'Draft' : 'Published'})`);
      });
    }
    
    // Try to publish the existing draft release
    if (releases.data.length > 0) {
      const draftRelease = releases.data.find(release => release.draft);
      if (draftRelease) {
        console.log(`\nFound draft release: ${draftRelease.name || draftRelease.tag_name}`);
        console.log('Attempting to publish this draft release...');
        
        const updatedRelease = await octokit.repos.updateRelease({
          owner,
          repo,
          release_id: draftRelease.id,
          draft: false
        });
        
        console.log('Success! Draft release has been published.');
        console.log('Release URL:', updatedRelease.data.html_url);
      }
    }
    
    // Optional: Try to create a new test release
    /*
    console.log('\nCreating a test release...');
    const testRelease = await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: 'test-tag',
      name: 'Test Release',
      body: 'This is a test release created by the test script.',
      draft: false,
      prerelease: false
    });
    console.log('Test release created successfully:', testRelease.data.html_url);
    */
    
  } catch (error) {
    console.error('Error accessing GitHub repository:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      if (error.response.data.errors) {
        console.error('Errors:', error.response.data.errors);
      }
    } else {
      console.error(error.message);
    }
  }
}

testRepositoryAccess();