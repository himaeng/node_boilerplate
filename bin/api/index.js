'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _package = require('../../package.json');

var _express = require('express');

exports.default = function () {
	var api = (0, _express.Router)();

	api.get('/', function (req, res) {
		res.json({ version: _package.version });
	});

	// perhaps expose some API metadata at the root
	api.post('/', function (req, res) {
		var data = format(req.body);
		console.log(data);

		var _calTDEE = calTDEE(data),
		    main_tdee = _calTDEE.main_tdee,
		    energy_weight_loss = _calTDEE.energy_weight_loss,
		    loseweight = _calTDEE.loseweight;

		res.json({
			messages: [{
				text: '\n\t\t\t\t\t\t\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27\n\t\t\t\t\t\t\u0E04\u0E48\u0E48\u0E48\u0E48\u0E48\u0E48\u0E48\u0E48\u0E32\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E17\u0E33\u0E43\u0E2B\u0E49\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E04\u0E07\u0E17\u0E35\u0E48(TDEE) ' + main_tdee + '\n\t\t\t\t\t\t\u0E04\u0E48\u0E32\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E43\u0E2B\u0E21\u0E48\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E40\u0E1E\u0E34\u0E48\u0E21/\u0E25\u0E14\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 ' + energy_weight_loss + '\n\t\t\t\t\t\t\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E08\u0E30\u0E40\u0E1E\u0E34\u0E48\u0E21/\u0E25\u0E14\u0E2A\u0E31\u0E1B\u0E14\u0E32\u0E2B\u0E4C\u0E25\u0E30 ' + loseweight + '\n\t\t\t\t\t\t'
			}]
		});
	});

	return api;
};

var formatWorkoutFrequency = function formatWorkoutFrequency(weightFrequency) {
	switch (weightFrequency) {
		case 'ไม่เล่นเลย':
			return 1.2;
		case '3 ครั้ง/สัปดาห์':
			return 1.375;
		case '4 ครั้ง/สัปดาห์':
			return 1.4187;
		case '5 ครั้ง/สัปดาห์':
			return 1.4625;
		case '6 ครั้ง/สัปดาห์':
			return 1.5063;
		case 'ทุกวัน':
			return 1.6375;
	}
};

var formatNumofMeal = function formatNumofMeal(food) {
	switch (food) {
		case '2 มื้อ':
			return 2;
		case '3 มื้อ':
			return 3;
		case '4 มื้อ':
			return 4;
		case '5 มื้อ':
			return 5;
		case '6 มื้อ':
			return 6;
		case '7 มื้อ':
			return 7;
	}
};

var formatGoal = function formatGoal(goal) {
	switch (goal) {
		case 'ลดน้ำหนัก':
			return 'loseWeight';
		case 'เพิ่มน้ำหนัก':
			return 'muscleGain';
	}
};

var formatGoalOption = function formatGoalOption(goalType) {
	switch (goalType) {
		case 'ปกติ':
			return 'normal';
		case 'เร่งด่วน':
			return 'quick';
	}
};

var format = function format(_ref) {
	var gender = _ref.gender,
	    age = _ref.age,
	    height = _ref.height,
	    weight = _ref.weight,
	    fat = _ref.fat,
	    weightFrequency = _ref.weightFrequency,
	    food = _ref.food,
	    goal = _ref.goal,
	    goalType = _ref.goalType;


	var workoutFrequency = formatWorkoutFrequency(weightFrequency);
	var numOfMeal = formatNumofMeal(food);
	var goalFormated = formatGoal(goal);
	var goalOption = formatGoalOption(goalType);

	return {
		gender: gender,
		age: parseInt(age),
		height: parseInt(height),
		weight: parseInt(weight),
		percentFat: parseInt(fat),
		workoutFrequency: workoutFrequency,
		goal: goalFormated,
		goalOption: goalOption,
		numOfMeal: numOfMeal
	};
};

var calMaintain = function calMaintain(gender, weight, height, age, percentFat, workoutFrequency) {
	var result = 0;
	var commonFormula = 10 * weight + 6.25 * height - 5 * age;

	if (percentFat === 0) {
		result = gender === "male" ? commonFormula + 5 : commonFormula - 162;
	} else {
		var leanMass = weight - weight * percentFat / 100;
		//const leanMassLbs = leanMass * 2.2;
		result = 21.6 * leanMass + 370;
	}

	return Math.round(result * workoutFrequency);
};

function calNutrient(percentFat, weight, maintain, goal, goalOption) {
	var protein = Math.ceil(0.95 * 2.2 * weight);
	var fat = Math.ceil(0.375 * 2.2 * weight);
	var formulaCarbOne = goal === 'loseWeight' ? maintain * 0.1 / 2 / 4 : maintain * 0.1 / 4;
	var formulaCarbTwo = percentFat === 0 ? Math.ceil(formulaCarbOne) : Math.floor(formulaCarbOne);
	var commonFormulaCarb = Math.floor((maintain - protein * 4 - fat * 9) / 4);
	var carb = goalOption === 'normal' ? commonFormulaCarb - formulaCarbTwo : commonFormulaCarb + 125;

	return { protein: protein, carb: carb, fat: fat };
}

function calTDEE(_ref2) {
	var gender = _ref2.gender,
	    age = _ref2.age,
	    height = _ref2.height,
	    weight = _ref2.weight,
	    percentFat = _ref2.percentFat,
	    workoutFrequency = _ref2.workoutFrequency,
	    goal = _ref2.goal,
	    goalOption = _ref2.goalOption,
	    numOfMeal = _ref2.numOfMeal;

	var maintain = calMaintain(gender, weight, height, age, percentFat, workoutFrequency);
	console.log('maintain: ', maintain);
	var nutrients = calNutrient(percentFat, weight, maintain, goal, goalOption);
	console.log('nutrients: ', nutrients);

	var mainTDEE = nutrients.protein * 4 + Math.floor((maintain - nutrients.protein * 4 - nutrients.fat * 9) / 4) * 4 + nutrients.fat * 9;
	console.log('mainTDEE: ', mainTDEE);

	//รวมแคลอรี่
	var totalCalories = nutrients.protein * 4 + nutrients.carb * 4 + nutrients.fat * 9;
	var totalCaloriesPerMeal = Math.ceil(totalCalories / numOfMeal);

	//ต่อวัน
	var cal_perday_protein = nutrients.protein * 4;
	var cal_perday_fat = nutrients.fat * 9;
	var cal_perday_carbohydrate = nutrients.carb * 4;

	var div_perday_protein = Math.round(cal_perday_protein / totalCalories, -2) * 100;
	var div_perday_fat = Math.round(cal_perday_fat / totalCalories, -2) * 100;
	var div_perday_carbohydrate = Math.round(cal_perday_carbohydrate / totalCalories, -2) * 100;

	//ต่อมื้อ
	var permeals_protein = Math.ceil(nutrients.protein / numOfMeal);
	var permeals_fat = Math.ceil(nutrients.fat / numOfMeal);
	var permeals_carbohydrate = Math.ceil(nutrients.carb / numOfMeal);

	var cal_permeals_protein = Math.ceil(cal_perday_protein / numOfMeal);
	var cal_permeals_fat = Math.ceil(cal_perday_fat / numOfMeal);
	var cal_permeals_carbohydrate = Math.ceil(cal_perday_carbohydrate / numOfMeal);

	var div_permeals_protein = Math.round(cal_permeals_protein / totalCaloriesPerMeal, -2) * 100;
	var div_permeals_fat = Math.round(cal_permeals_fat / totalCaloriesPerMeal, -2) * 100;
	var div_permeals_carbohydrate = Math.round(cal_permeals_carbohydrate / totalCaloriesPerMeal, -2) * 100;

	//การคาร์ดิโอ และคาร์โบไฮเดตรต้องลด
	var valCadio = Math.ceil(maintain * 10 / 100 / 2);
	var valCarbohydrate = Math.ceil(maintain * 10 / 100 / 4 / 7 / 2);

	//น้ำหนักที่จะเพิ่มได้
	var loseweight = Math.round(mainTDEE * 10 / 100 * 0.000143 * 7, 1);

	//ค่าพลังงานสำหรับเพิ่มกล้ามเนื้อ/น้ำหนัก
	var energy_weight_loss = Math.floor(mainTDEE - mainTDEE * 10 / 100);

	//แบบค่อยเป็นค่อยไป
	if (goalOption === 'normal') {
		valCadio = 0;
		valCarbohydrate = Math.ceil(maintain * 10 / 100 / 4 / 7);

		//น้ำหนักที่จะเพิ่มได้
		loseweight = Math.round(mainTDEE * 10 / 100 * 0.000143 * 7 * 10) / 10;

		//ค่าพลังงานสำหรับเพิ่มกล้ามเนื้อ/น้ำหนัก
		energy_weight_loss = Math.floor(mainTDEE * 1.1);
	}

	//อัตราการเต้นของหัวใจที่เหมาะสม
	var minHeartRate = Math.floor((200 - age) * 60 / 100);
	var maxHeartRate = Math.ceil((200 - age) * 70 / 100);

	//แคลลอรี่จากการคาร์ดิโอ/สัปดาห์
	var cadioperweek = valCadio * 7;

	return {
		main_tdee: mainTDEE,
		energy_weight_loss: energy_weight_loss,
		loseweight: loseweight,
		valCadio: valCadio,
		minHeartRate: minHeartRate,
		maxHeartRate: maxHeartRate,
		cadioperweek: cadioperweek,
		totalCalories: totalCalories,
		protein: nutrients.protein,
		cal_perday_protein: cal_perday_protein,
		div_perday_protein: div_perday_protein,
		fat: nutrients.fat,
		cal_perday_fat: cal_perday_fat,
		div_perday_fat: div_perday_fat,
		carb: nutrients.fat,
		cal_perday_carbohydrate: cal_perday_carbohydrate,
		div_perday_carbohydrate: div_perday_carbohydrate,
		permeals_protein: permeals_protein,
		cal_permeals_protein: cal_permeals_protein,
		div_permeals_protein: div_permeals_protein,
		permeals_fat: permeals_fat,
		cal_permeals_fat: cal_permeals_fat,
		div_permeals_fat: div_permeals_fat,
		permeals_carbohydrate: permeals_carbohydrate,
		cal_permeals_carbohydrate: cal_permeals_carbohydrate,
		div_permeals_carbohydrate: div_permeals_carbohydrate,
		totalCaloriesPerMeal: totalCaloriesPerMeal
	};
}
//# sourceMappingURL=index.js.map