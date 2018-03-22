import {
  RECEIVE_FOLLOW,
  REMOVE_FOLLOW
} from '../actions/follow_actions';
import {
  RECEIVE_USER
} from '../actions/user_actions';
import {
  merge,
  remove
} from 'lodash'
import {
  RECEIVE_CURRENT_USER
} from '../actions/session_actions'
const followsReducer = (state = {}, action) => {
  const newState = merge({}, state);
  switch (action.type) {
    case RECEIVE_FOLLOW:
      {
        if (!newState[action.follow.followerId]) {
          newState[action.follow.followerId] = [];
        }
        newState[action.follow.followerId].push(action.follow.followedId);
        return newState;
      }
    case REMOVE_FOLLOW:
      {
        remove(newState[action.follow.follower_id][action.follow.followable_type], (n) => n === action.follow.followable_id);
        // 
        return newState;
      }
    case RECEIVE_CURRENT_USER:
    // 
      if (!action.user) return state;
        
    case RECEIVE_USER: //when we receive a user also populate his followers/follows
      {
        action.user.followers.forEach((followerId) => { //populate state for each of user's followers
          if (!newState[followerId]) {
            newState[followerId] = new Set;
          }
          newState[followerId].add(action.user.id); 
        });
        action.user.following.forEach((followeeId) => { //populate state for each of user's followed users
          if (!newState[action.user.id]) {
            newState[action.user.id] = new Set;
          }
          newState[action.user.id].add(followeeId);
        
        });
        return newState;
      }

    default:
      {
        return state;
      }

  }
};

export default followsReducer;
// state:
//   {
//   followerId: {
//     users: [4, 5, 6], //followed users
//     topics: []
//   }
// }