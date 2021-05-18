import Http from '../http';

const http = new Http();

export const getUserByUserID = payload => async (dispatch) => {
  const result = await http.get('getUserByUserID', {
    userID: payload
  });
  const action = {
    type: 'GET_USER_BY_USER_ID',
    payload: result.res
  };
  dispatch(action);
}

export const getUserBehaviorsByUserID = payload => async (dispatch) => {
  const result = await http.get('getUserBehaviorsByUserID', {
    userID: payload
  });
  const action = {
    type: 'GET_USER_BEHAVIORS_BY_USER_ID',
    payload: result.res
  };
  dispatch(action);
}

export const updateUserID = payload => ({
  type: 'UPDATE_USER_ID',
  payload
});

export const updateDayTime = payload => ({
  type: 'UPDATE_DAY_TIME',
  payload
});

export const getUserBehaviorsOfHourByTime = payload => async (dispatch) => {
  const result = await http.get('getUserBehaviorsOfHourByTime', {
    userID: payload.userID,
    time: payload.time
  });
  const action = {
    type: 'GET_USER_BEHAVIORS_OF_HOUR_BY_TIME',
    payload: result.res
  };
  dispatch(action);
}

export const getUserBehaviorsOfMinByTime = payload => async (dispatch) => {
  const result = await http.get('getUserBehaviorsOfMinByTime', {
    userID: payload.userID,
    time: payload.time
  });
  const action = {
    type: 'GET_USER_BEHAVIORS_OF_MIN_BY_TIME',
    payload: result.res
  };
  dispatch(action);
}

// export const getMinUserBehaviorsByTime = payload => async (dispatch) => {
//   const result = await http.get('getMinUserBehaviorsByTime', {
//     userID: payload.userID,
//     time: payload.time
//   });
//   const action = {
//     type: 'GET_MIN_USER_BEHAVIORS_BY_TIME',
//     payload: result.res
//   };
//   dispatch(action);
// }