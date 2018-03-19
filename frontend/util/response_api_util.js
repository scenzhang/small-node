export const fetchResponses = (articleId) => {
  return $.ajax({url:`api/articles/${articleId}/responses`});
}
export const fetchResponse = (id) => {
  return $.ajax({url:`api/responses/${id}`});
}

export const fetchReplies = (id) => {
  return $.ajax({url: `api/responses/${id}/replies`});
}

export const createResponse = ({body, article_id, parentResponseId}) => $.ajax({
  url: `api/responses`,
  method: 'post',
  data: {body, articleId: article_id, parentResponseId}
});
export const updateResponse = ({id, title, body}) => $.ajax({
  url: `api/responses/${id}`,
  method: 'patch',
  data: {title, body}
});
export const deleteResponse = id => $.ajax({
  url: `api/responses/${id}`,
  method: 'delete'
});
