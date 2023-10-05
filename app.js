
const express = require('express');

const app = express();
const port = 3000;

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${url}: ${error.message}`);
    return null;
  }
};

const getCommentsForPost = async (postId) => {
  try {
    const commentsUrl = `http://jsonplaceholder.typicode.com/posts/${postId}/comments`;
    return await fetchData(commentsUrl);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const formatUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: `${user.address.city}, ${user.address.street}, ${user.address.suite}`,
    website: `https://${user.website}`,
    company: user.company.name,
  };
};

const formatPost = (post, user, userErvin, postComments) => {
  if (user === userErvin) {
    return {
      id: post.id,
      title: post.title,
      title_crop: post.title.length > 20 ? `${post.title.slice(0, 20)}...` : post.title,
      body: post.body,
      comments: user === userErvin ? postComments[post.id] : undefined,
    };
  } else
    return {
      id: post.id,
      title: post.title,
      title_crop: post.title.length > 20 ? `${post.title.slice(0, 20)}...` : post.title,
      body: post.body,
    };
}


const getUsersWithPosts = async () => {
  try {
    const usersUrl = 'http://jsonplaceholder.typicode.com/users';
    const postsUrl = 'http://jsonplaceholder.typicode.com/posts';

    const [users, posts] = await Promise.all([fetchData(usersUrl), fetchData(postsUrl)]);

    if (!users || !posts) {
      console.error('Failed to fetch data.');
      return;
    }

    const userErvin = users.find(user => user.name === 'Ervin Howell');
    const userErvinPosts = posts.filter(post => post.userId === userErvin.id);
    const postComments = {};

    for (const post of userErvinPosts) {
      const comments = await getCommentsForPost(post.id);
      postComments[post.id] = comments;
    }

    const result = users.slice(0, 10).map(user => {
      const userPosts = posts.filter(post => post.userId === user.id);
      return {
        ...formatUser(user),
        posts: userPosts.map(post => formatPost(post, user, userErvin, postComments)),
      };
    });
    console.dir(result, { depth: null });
    // console.log(result);
    return result;
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

app.get('/', async (req, res) => {
  try {
    const usersWithPosts = await getUsersWithPosts();
    res.json(usersWithPosts);
    console.dir(usersWithPosts, { depth: null });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  
  const usersWithPosts = await getUsersWithPosts();
  console.dir(usersWithPosts, { depth: null });
});