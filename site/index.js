
// Check to see if we have service workers available. If we do,
// register our service worker to cache our data files.
if(navigator.serviceWorker) {
    navigator.serviceWorker
	.register('sw.js')
	.then(function() { console.log("Service Worker Registered"); });
}

// Get the initial store state from local storage, if present.
var initialState = undefined;

try {
    initialState = JSON.parse(window.localStorage.getItem('store')) || undefined;
} catch(e) {

}

// Create a redux store to handle our application state.
var store = Redux.createStore(Redux.combineReducers(window.DiceReducers), initialState);

// Subscribe for changes to the state so that we update our UI appropriately.
store.subscribe(redisplay);
store.subscribe(storeState);

// Set up the UI from the initial state if there is one (our
// subscribed function doesn't get called when we set up with an
// existing iniital state).
redisplay();

// Redisplay the UI from the stored state.
function redisplay() {
    var state = store.getState();

    console.log(state);

    // The saved input (the dice formula)
    document.querySelector('#formula').value = state.input;

    // The last result if there was one.
    document.querySelector('#result-formula').textContent = state.resultFormula;
    // The value of the last result.
    document.querySelector('#result').textContent = state.resultValue;

    // Update the class if we have a result or not.
    document.querySelector('#result-header').classList.toggle('have-result', state.hasResult);

    // Update the recent rolls list
    var recentList = document.querySelector('#recent-list');

    // Remove all existing children
    while(recentList.firstChild) {
	recentList.removeChild(recentList.firstChild);
    }

    // Get the recent item template
    var template = document.querySelector('#recent-formula');

    // Update the list
    state.recentRolls
	.map(
	    function(rollExpr) {
		// Create a new item node, and set it's content value.
		var node = document.importNode(template.content, true);
		node.querySelector('.content').textContent = rollExpr;

		return node;
	    })
	.forEach(
	    function(element) {
		// Add the item to the list
		recentList.appendChild(element);
	    });
}

// Store the state back into local storage.
function storeState() {
    // Try to store the state back into local storage
    try {
	window.localStorage.setItem('store', JSON.stringify(store.getState()));
    } catch(e) {

    }
}

// Handle the roll button.
document.querySelector('#roll').addEventListener('click', function() {
    // Get the current input
    var expr = store.getState().input;

    try {
	// Parse the expression.
	var parsedExpr = Dice.parse(expr);

	// Evaluate the expression
	var result = evalExpr(parsedExpr);

	// Update the store with the results
	store.dispatch(DiceActions.resultGenerated(result.value, result.str));

	// Update the recent rolls list with the successful roll.
	store.dispatch(DiceActions.recentRoll(expr));
	
    } catch(e) {
	// If we get an error evaluating the state, show an error message.
	store.dispatch(DiceActions.resultGenerated('E', e.message));

	// We don't update the recent rolls list.
    }    
});

// Handle the input changing.
document.querySelector('#formula').addEventListener(
    'change',
    function(event) {
	// Update the store with the changed value.
	store.dispatch(DiceActions.assignInput(event.target.value));
    });

// Handle any buttons that manipulate the input state.
document.querySelectorAll('.bind-value').forEach(function(el) {
    el.addEventListener('click', function() {
	// Simply append the value of the button to the input.
	store.dispatch(DiceActions.appendToInput(el.value));
    });
});

// Handle the clear button
document.querySelector('#clear').addEventListener('click', function() {
    // Clear the input and results.
    store.dispatch(DiceActions.clear());
});

// Handle the delete button
document.querySelector('#delete').addEventListener('click', function() {
    // Remove the last element from the input.
    store.dispatch(DiceActions.deleteInput());
});

// Handle clicks on recent items.
document.querySelector('#recent-list').addEventListener('click', function(event) {
    // If the user clicked on an item, then handle it.
    if(event.target.classList.contains('recent-item')) {
	// Update the current input with the selected item.
	store.dispatch(DiceActions.assignInput(event.target.textContent));
    }
});

// Define the operations that are valid in expressions.
var ops = {
    '+': binop('+', function (a, b) { return a + b; }),
    '-': binop('-', function (a, b) { return a - b; }),
    '*': binop('*', function (a, b) { return a * b; }),
    '/': binop('/', function (a, b) { return a / b; }),
    'dice': diceop,
    'parens': parensop
};

function ExprResult(value, str) {
    this.value = value;
    this.str = str;
}

// Evaluate an expression
function evalExpr(expr) {
    // Check the expression node type.
    if(expr.op) {
	// This is an operation, perform the operation.
	return ops[expr.op](expr);
    } else {
	// This is a value, return the value.
	return new ExprResult(expr.value, expr.value);
    }
}

// A function that returns a function that performs some binary operation.
function binop(op, fn) {
    return function(expr) {
	// Get the left and right values.
	var left = evalExpr(expr.args[0]);
	var right = evalExpr(expr.args[1]);

	// Compute the result
	var result = fn(left.value, right.value);
	
	// Return an expression result with the result value and stringified representation.
	return new ExprResult(
	    result,
	    left.str + ' ' + op + ' ' + right.str);
    };
}

function parensop(expr) {
    var result = evalExpr(expr.expr);
    
    return new ExprResult(
	result.value,
	'(' + result.str + ')');
}

// A function that evaluates a dice expression.
function diceop(expr) {
    // Get the number of sides and the number of dice to roll.
    var sides = evalExpr(expr.sides).value;
    var count = evalExpr(expr.count).value;

    // Store an array of results.
    var result = [];

    // Roll each die.
    for(var i = 0; i < count; ++i) {
	result.push(roll(sides));
    }

    // Compute the value of all of the dice.
    var value = result.reduce(function (m, a) { return m + a; }, 0);

    // Format the dice rolls into a string.
    var resultStr = formatDice(result);

    // Return the expression result
    return new ExprResult(value, resultStr);
}

// Nicely format the results of a die roll.
function formatDice(results) {
    if(results.length === 0) {
	// If there were no dice, just return 0.
	return '0';
    } else if(results.length === 1) {
	// If there was only a single die roll, don't add parentheses.
	return results[0];
    } else {
	// Summation in parentheses.
	return '(' + results.join(' + ') + ')';
    }
}

// Roll a single die with the given number of sides (properly handling
// 0 sides).
function roll(sides) {
    return Math.floor(Math.random() * sides) + (sides === 0 ? 0 : 1);
}
