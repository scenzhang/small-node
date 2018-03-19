export const fetchArticles = () => $.ajax({url:'api/articles'});
export const fetchArticle = id => $.ajax({
  url: `api/articles/${id}`
});
export const createArticle = ({title, body, blurb}) => $.ajax({
  url: `api/articles`,
  method: 'post',
  data: {title, body, blurb}
});
export const updateArticle = ({id, title, body, blurb}) => $.ajax({
  url: `api/articles/${id}`,
  method: 'patch',
  data: {title, body, description: blurb}
});
export const deleteArticle = id => $.ajax({
  url: `api/articles/${id}`,
  method: 'delete'
});
// export const fetchFeed = userId => $.ajax({
//   url: `api/users/${userId}/feed`
// })
