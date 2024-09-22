/* eslint-disable react/prop-types */
import React from 'react';
import { IF } from '../url';

// Utility function to strip HTML tags
const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const HomePosts = ({ post }) => {
  return (
    <div className="max-w-[390px] w-full bg-white shadow-lg rounded-2xl overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"> {/* Increased max-width */}
      {/* Image Section */}
      <div className="w-full h-[180px]">
        <img 
          src={IF + post.photo} 
          alt={post.title} 
          className="h-full w-full object-cover rounded-t-2xl transition-transform duration-300 hover:scale-110"
        />
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        <h1 className="text-lg font-bold mb-2 text-gray-900">{post.title}</h1>
        
        <p className="text-sm text-gray-600 mb-4">{stripHtml(post.desc).slice(0, 100) + '...Read more'}</p>
        
        <div className="flex items-center justify-between">
          {/* User and Date */}
          <div className="flex items-center space-x-2">
            {/* <img
              src={post.userImage} // Assuming you have a userImage field
              alt={post.username}
              className="w-8 h-8 rounded-full"
            /> */}
            <p className="text-sm text-gray-700 font-medium">@{post.username}</p>
          </div>
          
          {/* Date */}
          <p className="text-sm text-gray-500">{new Date(post.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePosts;
