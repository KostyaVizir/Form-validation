
//серверная валидация email-а
//    строка 82 - вызов функции с отправкой запроса
//    92-105 - функция коллбек Mycallback
//    105-116 - функция отправки запроса emailAlreadyRegistered


(function () {
	'use strict';

	function addClass(el, cls) {
	  var c = el.className ? el.className.split(' ') : [];
	  for (var i=0; i<c.length; i++) {
	    if (c[i] == cls) return; }
	  c.push(cls);
	  el.className = c.join(' ');
	}

	function removeClass(el, cls) {
	  var c = el.className.split(' ');
	  for (var i=0; i<c.length; i++) {
	    if (c[i] == cls) c.splice(i--, 1);  }
	  el.className = c.join(' ');
	}

	function addEvent(obj, eventName, handler) {
	var handlerWrapper = function(event) {
		event = event || window.event;
		if (!event.target && event.srcElement) {
			event.target = event.srcElement;
		}
		return handler.call(obj, event);
	};
	if (obj.addEventListener) {
		obj.addEventListener(eventName, handlerWrapper, false);
	} else if (obj.attachEvent) {
		obj.attachEvent('on' + eventName, handlerWrapper);
	}
	return handlerWrapper;
	}


    function FormValidator() {
    	this.formToFill = document.querySelector('form');
    	this.email = document.getElementById('email');
    	this.password = document.getElementById('password');
    	this.phone = document.getElementById('phone');
    	this.termsCheckbox = document.querySelector('input[type="checkbox"]');
    	this.submitButton = document.querySelector('button[type="submit"]');

    	addEvent(this.email, 'keyup', this.emailValidator.bind(this));
    	addEvent(this.password, 'keyup', this.passwordValidator.bind(this));
    	addEvent(this.phone, 'keyup', this.phoneValidator.bind(this));
    	addEvent(this.termsCheckbox, 'click', this.CheckboxValidator.bind(this));

        addEvent(this.email, 'blur', this.emailValidator.bind(this));
        addEvent(this.formToFill, 'submit', this.submitForm.bind(this));

    	this.emailFlagOk = false;
    	this.passFlag = false;
    	this.phoneFlag = true;
    	this.termsCheckboxFlag = false;
        this.emailUsed = true;
	}



	FormValidator.prototype.emailValidator = function () {
		this.keyupTimeout = null;
		clearTimeout(this.keyupTimeout);
		var _this = this;
		this.keyupTimeout = setTimeout(function () {
			var reg = /^[a-zA-Z0-9._]+?@[a-z0-9.-]+\.[a-z0-9.-]+$/g;
			var trimed = _this.email.value.trim();
			if (trimed.length === 0) {
                _this.emailFlagOk = false;
				_this.addErrorMessange('Поле обьязательно к заполнению', _this.email);
			}
			else if (!reg.test(trimed)) {
				_this.emailFlagOk = false;
				_this.addErrorMessange('Неверный формат', this.email);
			}
			else {
                // check if email is used:
                _this.emailAlreadyRegistered(trimed, _this.myCallback);
                // continued execition of the program stream:
				_this.emailFlagOk = true;
				removeClass(this.email.parentNode, 'has-error');
				_this.deleteErrorMessange(_this.email);
			}
			_this.enableOrDesableSubmit();
		}, 500);
	};

    FormValidator.prototype.myCallback = function (response) {
        var answer = JSON.parse(response);
        console.log('answer.used ',answer.used);
        if (answer.used === true) {
            this.emailFlagOk = false;
            this.emailUsed = false;
            this.addErrorMessange('Такой пользователь уже зарегистрирован', this.email);
            this.enableOrDesableSubmit()
        } else {
            this.emailUsed = true;
            this.enableOrDesableSubmit()
        }
    };

    FormValidator.prototype.emailAlreadyRegistered = function (emailToCheck, callback) {
        var _this = this;
        var STATE_READY = 4;
        console.log('request sent');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://aqueous-reaches-8130.herokuapp.com/check-email/?email=' + emailToCheck + '', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState != STATE_READY) return;
            callback.call(_this, xhr.responseText);
        };
        xhr.send(null);
    };

	FormValidator.prototype.passwordValidator = function () {
		this.keyupTimeout = null;
		clearTimeout(this.keyupTimeout);
		var _this = this;
		this.keyupTimeout = setTimeout(function () {
			var regSimbolsAllowed = /^[a-zA-Z0-9_-]+?$/g;
			var regVerySimple = /[^a-zA-Z0-9]+?/g;
			var trimed = _this.password.value.trim();
			if (trimed.length === 0) {
				_this.passFlag = false;
				_this.addErrorMessange('Поле обьязательно к заполнению' , _this.password);
			}
			else if (!regSimbolsAllowed.test(trimed)) {
				_this.passFlag = false;
				_this.addErrorMessange('Пароль содержит запрещенные символы. Разрешены a-z A-Z 0-9 _ -' , _this.password);
			}
			else if (trimed.length <= 5) {
				_this.passFlag = false;
				_this.addErrorMessange('Пароль должен быть длинее 5ти символов', _this.password);
			}
			else if (!regVerySimple.test(trimed)) {
				_this.passFlag = false;
				_this.addErrorMessange('Слишком просто. Пароль должен содержать другие символы кроме a-z A-Z 0-9', _this.password);
			}
			else {
				_this.passFlag = true;
				removeClass(_this.password.parentNode, 'has-error');
				_this.deleteErrorMessange(_this.password);
			}
			_this.enableOrDesableSubmit();
		}, 500);
	};



	FormValidator.prototype.phoneValidator = function () {
		this.keyupTimeout = null;
		clearTimeout(this.keyupTimeout);
		var _this = this;
		this.keyupTimeout = setTimeout(function () {
			var regPhone = /^\+380\d{9}$/g;
			var trimed = _this.phone.value.trim();
			if (trimed.length === 0) {
				_this.deleteErrorMessange(_this.phone);
				_this.phoneFlag = true;
				_this.enableOrDesableSubmit();
				removeClass(_this.phone.parentNode, 'has-error');
			}
			else if (!regPhone.test(trimed)) {
				_this.phoneFlag = false;
				_this.addErrorMessange('Не соответсвует международному форматиу +380 ХХ ХХ ХХ ХХХ' , _this.phone);
			}
			else {
				_this.phoneFlag = true;
				removeClass(_this.phone.parentNode, 'has-error');
				_this.deleteErrorMessange(_this.phone);
			}
			_this.enableOrDesableSubmit();
		}, 500);
	};

	FormValidator.prototype.CheckboxValidator = function () {
    	this.termsCheckboxFlag = (this.termsCheckbox.checked) ? true : false;
		this.enableOrDesableSubmit();
	};


	FormValidator.prototype.addErrorMessange = function (errorText, node) {
        this.deleteErrorMessange(node);
		addClass(node.parentNode, 'has-error');
		var divError = document.createElement('div');
		addClass(divError, 'alert');
		addClass(divError, 'alert-danger');
		var innerText = document.createTextNode(errorText);
		divError.appendChild(innerText);
		node.parentNode.appendChild(divError);
	};

	FormValidator.prototype.deleteErrorMessange = function (node) {
		var oldErrorMessange = node.parentNode.querySelector('.alert-danger');
		if (oldErrorMessange) {
			node.parentNode.removeChild(oldErrorMessange);
		}
	};

	FormValidator.prototype.enableOrDesableSubmit = function () {
		if (this.emailFlagOk === true &&
			this.passFlag === true &&
			this.phoneFlag === true &&
			this.termsCheckboxFlag === true ) {
			removeClass(this.submitButton, 'disabled');
            //return true;
		} else {
			addClass(this.submitButton, 'disabled');
            //return false;
		}
	};

	FormValidator.prototype.submitForm = function (event) {
        //if (!this.enableOrDesableSubmit()) {
        //    event.preventDefault();
        //}
		// formValid = this.submitButtom.hasClass('');
		//classList.contains
		// has Attribute
		// if (!formValid) {
			// event.preventDefault();
		// }

	};

	window.formValidator = new FormValidator();
	window.usedEmails = ['author@mail.com', 'foo@mail.com', 'tester@mail.com', 'ddd@gmail.com'];
} )();


	// console.log('_this.emailFlagOk', _this.emailFlagOk);
	// console.log('_this.passFlag', _this.passFlag);
	// console.log('_this.phoneFlag', _this.phoneFlag);
	// console.log('_this.termsCheckboxFlag', _this.termsCheckboxFlag);
	// console.log('------');