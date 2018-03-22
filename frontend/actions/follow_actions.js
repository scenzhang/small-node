import * as FollowUtil from '../util/follow_api_util';

export const RECEIVE_FOLLOW = 'RECEIVE_FOLLOW';
export const REMOVE_FOLLOW = 'REMOVE_FOLLOW';


export const receiveFollow = (follow) => ({
  type: RECEIVE_FOLLOW,
  follow
});

export const getFollow = (followerId, followableId) => dispatch => {
  return FollowUtil.getFollow(followerId, followableId)
    .then((follow => dispatch(receiveFollow(follow))));
};

export const createFollow = (followerId, followableId) => dispatch => {
  return FollowUtil.createFollow(followerId, followableId)
    .then((follow) => dispatch(receiveFollow(follow)));
};

export const removeFollow = (follow) => ({
  type: REMOVE_FOLLOW,
  follow
});

export const deleteFollow = (followerId, followableId) => dispatch => {
  return FollowUtil.deleteFollow(followerId, followableId)
    .then((follow) => dispatch(removeFollow(follow)));
};