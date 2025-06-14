#!/usr/bin/env node

// Test script to see what WordPress actually returns for movie data
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WORDPRESS_API_URL = process.env.VITE_WORDPRESS_API_URL;
const WP_USERNAME = process.env.VITE_WP_USERNAME;
const WP_PASSWORD = process.env.VITE_WP_PASSWORD;

async function fetchWordPressMovieData() {
  console.log('Fetching WordPress movie data to see actual structure...');
  
  if (!WP_USERNAME || !WP_PASSWORD) {
    console.error('❌ WordPress credentials not found');
    return;
  }

  try {
    const auth = Buffer.from(`${WP_USERNAME}:${WP_PASSWORD}`).toString('base64');
    
    // Get movies from WordPress
    console.log('\n1. Fetching movies from WordPress...');
    const moviesResponse = await axios.get(`${WORDPRESS_API_URL}/movies`, {
      headers: {
        'Authorization': `Basic ${auth}`
      },
      params: {
        per_page: 1,
        _embed: true
      }
    });

    if (moviesResponse.data.length > 0) {
      const movie = moviesResponse.data[0];
      console.log('\n2. First movie data structure:');
      console.log(JSON.stringify(movie, null, 2));
      
      console.log('\n3. Movie poster field specifically:');
      console.log('movie_poster:', movie.movie_poster);
      console.log('movie_poster type:', typeof movie.movie_poster);
      
      // Check if there are other poster-related fields
      console.log('\n4. All fields containing "poster":');
      Object.keys(movie).forEach(key => {
        if (key.toLowerCase().includes('poster')) {
          console.log(`${key}:`, movie[key]);
        }
      });
      
      // Check if there are _embedded media files
      if (movie._embedded) {
        console.log('\n5. Embedded data:');
        console.log(JSON.stringify(movie._embedded, null, 2));
      }
      
      // Check meta fields
      if (movie.meta) {
        console.log('\n6. Meta fields:');
        console.log(JSON.stringify(movie.meta, null, 2));
      }
      
    } else {
      console.log('No movies found');
    }

  } catch (error) {
    console.error('❌ Failed to fetch movie data:', error.response?.data?.message || error.message);
  }
}

fetchWordPressMovieData().catch(console.error);
