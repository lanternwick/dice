
if(navigator.serviceWorker) {
    navigator.serviceWorker
	.register('sw.js')
	.then(function() { console.log("Service Worker Registered"); });
}

var store = Redux.createStore(Redux.combineReducers(window.DiceReducers));

store.subscribe(
    function() {
	var state = store.getState();

	console.log(state);
	
	document.querySelector('#formula').value = state.input;
	document.querySelector('#result-formula').innerText = state.resultFormula;
	document.querySelector('#result').innerText = state.resultValue;

	document.querySelector('#result-header').classList.toggle('have-result', state.hasResult);
	
    });

document.querySelector('#roll').addEventListener('click', function() {
    var expr = document.querySelector('#formula').value;

    try {
	var parsedExpr = Dice.parse(expr);

	console.log(parsedExpr);
	var result = evalExpr(parsedExpr);

	store.dispatch(DiceActions.resultGenerated(result.value, result.str));
	
    } catch(e) {

	store.dispatch(DiceActions.resultGenerated('E', e.message));
    }    
});

document.querySelector('#formula').addEventListener(
    'change',
    function(event) {
	store.dispatch(DiceActions.assignInput(event.target.value));
    });

document.querySelectorAll('.bind-value').forEach(function(el) {
    el.addEventListener('click', function() {
	store.dispatch(DiceActions.appendToInput(el.value));
    });
});

document.querySelector('#clear').addEventListener('click', function() {
    store.dispatch(DiceActions.clear());
});

document.querySelector('#delete').addEventListener('click', function() {
    store.dispatch(DiceActions.deleteInput());
});

var ops = {
    '+': binop('+', function (a, b) { return a + b; }),
    '-': binop('-', function (a, b) { return a - b; }),
    '*': binop('*', function (a, b) { return a * b; }),
    '/': binop('/', function (a, b) { return a / b; }),
    'dice': diceop
};

function evalExpr(expr) {
    if(expr.op) {
	return ops[expr.op](expr);
    } else {
	return {value: expr.value, str: expr.value };
    }
}

function binop(op, fn) {
    return function(expr) {
	var left = evalExpr(expr.args[0]);
	var right = evalExpr(expr.args[1]);
	return {
	    value: fn(left.value, right.value),
	    str: left.str + ' ' + op + ' ' + right.str
	};
    };
}

function diceop(expr) {
    var sides = evalExpr(expr.sides).value;
    var count = evalExpr(expr.count).value;

    var result = [];
    
    for(var i = 0; i < count; ++i) {
	result.push(roll(sides));
    }

    var value = result.reduce(function (m, a) { return m + a; }, 0);

    var resultStr = formatDice(result);
    
    return {
	value: value,
	str: resultStr
    };
}

function formatDice(results) {
    if(results.length === 0) {
	return '0';
    } else if(results.length === 1) {
	return results[0];
    } else {
	return '(' + results.join(' + ') + ')';
    }
}

function roll(sides) {
    return Math.floor(Math.random() * sides) + (sides === 0 ? 0 : 1);
}
