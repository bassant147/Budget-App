// BUDGET CONTROLLER
var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  Expense.prototype.calcPercentage = function(totalIncome) {

    this.percentage = Math.round(this.value / totalIncome * 100);

  }

  Expense.prototype.getPercentage = function() {

    return this.percentage;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(curr) {
      sum += curr.value;
    });
    data.totals[type] = sum;
  }

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1
  }

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      // create new id
      if(data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }      

      // create new item
      if(type === 'inc') {
        newItem = new Income(ID, des, val);
      } else if(type === 'exp') {
        newItem = new Expense(ID, des, val);
      }

      // push new item into our data structure
      data.allItems[type].push(newItem);

      // return new item
      return newItem;
    },

    deleteItem: function(type, ID) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(ID),

      data.allItems[type].splice(index, 1);
    },

    calculateBudget: function() {

      // calculate income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate budget = income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate percentage of expenses
      if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      })
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      })
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function() {
      console.log(data.allItems);
    }
  }

})();

// UI CONTROLLER
var UIController = (function() {

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');

    int = numSplit[0];

    if(int.length > 3) {
      int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp'? '- ' : '+ ') + int + '.' + dec;

  };


  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;

      if(type === 'inc') {
        element = DOMstrings.incomeContainer;

        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if(type === 'exp') {
        element = DOMstrings.expensesContainer;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }      

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {

      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(current => {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {

      var type = (obj.budget > 0 ? 'inc' : 'exp');
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }  
    },

    displayPercentages: function(percentages) {

      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      }

      nodeListForEach(fields, function(current, index) {
        if(percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }        

      });
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  }

})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if(event.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  }  

  var updateBudget = function() {

    // 1. calculate budget
    budgetCtrl.calculateBudget();

    // 2. return budget
    var budget = budgetCtrl.getBudget();

    // 3. update budget in ui
    UICtrl.displayBudget(budget);
  }

  var updatePercentages = function() {

    // 1. calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. get percentages
    var percentages = budgetCtrl.getPercentages();

    // 3. update percentages in ui
    UICtrl.displayPercentages(percentages);

  }

  var ctrlAddItem = function() {
    var input, newItem;

    // 1. get input from ui
    input = UICtrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value); 

      // 3. add item to ui
      UICtrl.addListItem(newItem, input.type);

      // 4. clear fields
      UICtrl.clearFields();

      updateBudget();

      updatePercentages();
    }
  }

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID) {

      // inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
    }

    // 1. delete item from the data structure
    budgetCtrl.deleteItem(type, ID);

    // 2. delete item from UI
    UICtrl.deleteListItem(itemID);

    // 3. update and show the budget
    updateBudget();

    // 4. update percentages
    updatePercentages();
  }

  return {
    init: function() {
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }

})(budgetController, UIController);

controller.init();