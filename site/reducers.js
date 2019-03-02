(function(exports) {

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
    
    exports.hasResult = hasResult;
    exports.resultFormula = resultFormula;
    exports.resultValue = resultValue;
    exports.input = input;
    
}(window.DiceReducers = {}));
