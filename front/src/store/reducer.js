const reducer = (state, action) => {
    switch (action.type) {
        case 'GET_USER_BY_USER_ID': {
            const { users } = state;
            // 将马赛克图的用户数量控制在5个以内
            let newUsers = [];
            if (users.length < 5) {
                newUsers = [...users, action.payload];
            } else {
                let tempUsers = users.slice();
                tempUsers.shift();
                newUsers = [...tempUsers, action.payload];
            }
            return {
                ...state,
                users: newUsers
            };
        }
        case 'GET_USER_BEHAVIORS_BY_USER_ID': {
            return {
                ...state,
                userBehaviors: action.payload
            };
        }
        case 'UPDATE_USER_ID': {
            return {
                ...state,
                userID: action.payload
            };
        }
        case 'UPDATE_DAY_TIME': {
            return {
                ...state,
                dayTime: action.payload
            };
        }
        case 'GET_USER_BEHAVIORS_OF_HOUR_BY_TIME': {
            const hourBehaviors = action.payload;
            return {
                ...state,
                hourBehaviors
            };
        }
        case 'GET_USER_BEHAVIORS_OF_MIN_BY_TIME': {
            const minBehaviorsOfHour = action.payload.minBehaviorsOfHour;
            const userMinBehaviors = action.payload.userMinBehaviors;
            return {
                ...state,
                minBehaviorsOfHour,
                userMinBehaviors
            };
        }
        // case 'GET_MIN_USER_BEHAVIORS_BY_TIME': {
        //     const userMinBehaviors = action.payload;
        //     return {
        //         ...state,
        //         userMinBehaviors
        //     };
        // }
        default:
            return state;
    }
};

export default reducer;
