(function(exports) {

    var MAX_RECENT_ELEMENTS = 5;
    
    function hasResult(state, action) {
	switch(action.type) {
	case "RESULT_GENERATED":
	    return true;
	case "CLEAR":
	    return false;
	default:
	    return state || false;
	}
    }

    function resultFormula(state, action) {
	switch(action.type) {
	case "RESULT_GENERATED":
	    return action.resultFormula;
	case "CLEAR":
	    return '';
	default:
	    return state || null;
	}
    }

    function resultValue(state, action) {
	switch(action.type){
	case "RESULT_GENERATED":
	    return action.resultValue;
	case "CLEAR":
	    return '';
	default:
	    return state || null;
	}
    }

    function previousResult(state, action) {
	switch(action.type){
	case "RESULT_GENERATED":
	    return action.previousValue;
	// case "CLEAR":
	//     return '';
	default:
	    return state || null;
	}
    }
    
    function input(state, action) {
	switch(action.type) {
	case "APPEND_TO_INPUT":
	    return state + action.toAppend;
	case "ASSIGN_INPUT":
	    return action.newInput;
	case "DELETE_INPUT":
	    return state.substr(0, state.length-1).trim();
	case "CLEAR":
	    return '';
	default:
	    return state || '';
	}
    }

    function recentRolls(state, action) {
	switch(action.type) {
	case "RECENT_ROLL":
	    return doRecentRoll(state, action);
	default:
	    return state || [];
	}

	function doRecentRoll(state, action) {
	    // Find the index of the expression in the existing list.
	    var index = state.indexOf(action.expression);
	    var newState;
	    
	    if(index !== -1) {
		// The expression is already in the list, so copy the
		// existing list and remove it from it's current
		// position
		newState = state.slice(0, MAX_RECENT_ELEMENTS);
		newState.splice(index, 1);
		
	    } else {
		// Otherwise make a copy of the current state, but truncate.
		newState = state.slice(0, MAX_RECENT_ELEMENTS-1);
	    }

	    // Insert the expression at the front of the new list.
	    newState.unshift(action.expression);

	    // Return the new state
	    return newState;
	}
    }
    
    exports.hasResult = hasResult;
    exports.resultFormula = resultFormula;
    exports.resultValue = resultValue;
    exports.input = input;
    exports.recentRolls = recentRolls;
    exports.previousResult = previousResult;
    
}(window.DiceReducers = {}));
