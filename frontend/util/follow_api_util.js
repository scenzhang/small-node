export const getFollow = (followerId, followedId) => {
  return $.ajax({
    url: `api/follows?followerId=${followerId}&followedId=${followedId}`
  })
};

export const createFollow = (followerId, followedId) => {
  return $.ajax({
    url: `api/follows`,
    method: 'post',
    data: {
      followerId, followedId
    }
  });
};



export const deleteFollow = (followerId, followedId) => {
  return $.ajax({
    url: `api/follows?followerId=${followerId}&followedId=${followedId}`,
    method: 'delete'
  });
};