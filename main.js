import { fetchData } from './fetchData.js';

//фетч комментариев
const getCommentsForPost = async (postId) => {
  try {
    const commentsUrl = `http://jsonplaceholder.typicode.com/posts/${postId}/comments`;
    return await fetchData(commentsUrl);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

//фетч пользователей
const formatUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: `${user.address.city}, ${user.address.street}, ${user.address.suite}`,
    website: `https://${user.website}`,
    company: user.company.name,
  };
}

//фетч постов
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

//объединение в общий массив
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
    console.log(result);
    return result;
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

getUsersWithPosts();
