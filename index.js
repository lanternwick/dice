
navigator.serviceWorker
    .register('sw.js')
    .then(function() { console.log("Service Worker Registered"); });

document.querySelector('#roll').addEventListener('click', function() {
    var expr = document.querySelector('#formula').value;

    try {
	var parsedExpr = Dice.parse(expr);

	console.log(parsedExpr);
	var result = evalExpr(parsedExpr);

	document.querySelector('#result-formula').innerText = result.str;
	document.querySelector('#result').innerText = result.value;
    } catch(e) {
	document.querySelector('#result-formula').innerText = e.message;
	document.querySelector('#result').innerText = 'E';
    }

    document.querySelector('#result-header').classList.add('have-result');
    
});


document.querySelectorAll('.bind-value').forEach(function(el) {
    el.addEventListener('click', function() {
	document.querySelector('#formula').value = document.querySelector('#formula').value + el.value;
    });
});

document.querySelector('#clear').addEventListener('click', function() {
    document.querySelector('#formula').value = '';
    document.querySelector('#result-formula').innerText = '';
    document.querySelector('#result').innerText = '';
    document.querySelector('#result-header').classList.remove('have-result');
});

document.querySelector('#delete').addEventListener('click', function() {
    var val = document.querySelector('#formula').value;
    document.querySelector('#formula').value = val.substr(0, val.length-1).trim();
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
