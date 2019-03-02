(function(exports) {

    function resultGenerated(value, formula) {
	return {
	    type: "RESULT_GENERATED",
	    resultFormula: formula,
	    resultValue: value
	};
    }

    function clear() {
	return {
	    type: "CLEAR"
	};
    }

    function appendToInput(toAppend) {
	return {
	    type: "APPEND_TO_INPUT",
	    toAppend: toAppend
	};
    }

    function assignInput(newInput) {
	return {
	    type: "ASSIGN_INPUT",
	    newInput: newInput
	};
    }

    function deleteInput() {
	return {
	    type: "DELETE_INPUT"
	};
    }
    
    exports.resultGenerated = resultGenerated;
    exports.clear = clear;
    exports.appendToInput = appendToInput;
    exports.assignInput = assignInput;
    exports.deleteInput = deleteInput;

}(window.DiceActions = {}));
