'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _package = require('../../package.json');

var _express = require('express');

exports.default = function () {
	var api = (0, _express.Router)();

	api.get('/', function (req, res) {
		var data = format(req.query);
		console.log('query get: ', req.query);
		console.log('data get: ', data);

		var _calTDEE = calTDEE(data),
		    main_tdee = _calTDEE.main_tdee,
		    energy_weight_loss = _calTDEE.energy_weight_loss,
		    loseweight = _calTDEE.loseweight,
		    valCadio = _calTDEE.valCadio,
		    minHeartRate = _calTDEE.minHeartRate,
		    maxHeartRate = _calTDEE.maxHeartRate,
		    cadioperweek = _calTDEE.cadioperweek,
		    protein = _calTDEE.protein,
		    cal_perday_protein = _calTDEE.cal_perday_protein,
		    div_perday_protein = _calTDEE.div_perday_protein,
		    carb = _calTDEE.carb,
		    cal_perday_carbohydrate = _calTDEE.cal_perday_carbohydrate,
		    div_perday_carbohydrate = _calTDEE.div_perday_carbohydrate,
		    fat = _calTDEE.fat,
		    cal_perday_fat = _calTDEE.cal_perday_fat,
		    div_perday_fat = _calTDEE.div_perday_fat,
		    totalCalories = _calTDEE.totalCalories,
		    permeals_protein = _calTDEE.permeals_protein,
		    cal_permeals_protein = _calTDEE.cal_permeals_protein,
		    div_permeals_protein = _calTDEE.div_permeals_protein,
		    permeals_carbohydrate = _calTDEE.permeals_carbohydrate,
		    cal_permeals_carbohydrate = _calTDEE.cal_permeals_carbohydrate,
		    div_permeals_carbohydrate = _calTDEE.div_permeals_carbohydrate,
		    permeals_fat = _calTDEE.permeals_fat,
		    cal_permeals_fat = _calTDEE.cal_permeals_fat,
		    div_permeals_fat = _calTDEE.div_permeals_fat,
		    totalCaloriesPerMeal = _calTDEE.totalCaloriesPerMeal;

		res.json(calTDEE(data));

		// res.json({
		// 	messages: [
		// 		{
		// 			text: `ข้อมูลส่วนตัว\nค่าพลังงานที่ทำให้น้ำหนักคงที่(TDEE) ${main_tdee}\nค่าพลังงานใหม่สำหรับเพิ่ม/ลดน้ำหนัก ${energy_weight_loss}\nน้ำหนักของคุณจะเพิ่ม/ลดสัปดาห์ละ ${loseweight}`
		// 		}
		// 	]
		// });
	});

	api.get('/v', function (req, res) {
		res.json({ version: _package.version });
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
		case 'เพิ่มกล้ามเนื้อ':
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
	//console.log('maintain: ', maintain);
	var nutrients = calNutrient(percentFat, weight, maintain, goal, goalOption);
	//console.log('nutrients: ', nutrients);

	var mainTDEE = nutrients.protein * 4 + Math.floor((maintain - nutrients.protein * 4 - nutrients.fat * 9) / 4) * 4 + nutrients.fat * 9;
	//console.log('mainTDEE: ', mainTDEE);

	//รวมแคลอรี่
	var totalCalories = nutrients.protein * 4 + nutrients.carb * 4 + nutrients.fat * 9;
	var totalCaloriesPerMeal = Math.ceil(totalCalories / numOfMeal);

	//ต่อวัน
	var cal_perday_protein = nutrients.protein * 4;
	var cal_perday_fat = nutrients.fat * 9;
	var cal_perday_carbohydrate = nutrients.carb * 4;

	var div_perday_protein = Math.round(cal_perday_protein / totalCalories * 100);
	var div_perday_fat = Math.round(cal_perday_fat / totalCalories * 100);
	var div_perday_carbohydrate = Math.round(cal_perday_carbohydrate / totalCalories * 100);

	//ต่อมื้อ
	var permeals_protein = Math.ceil(nutrients.protein / numOfMeal);
	var permeals_fat = Math.ceil(nutrients.fat / numOfMeal);
	var permeals_carbohydrate = Math.ceil(nutrients.carb / numOfMeal);

	var cal_permeals_protein = Math.ceil(cal_perday_protein / numOfMeal);
	var cal_permeals_fat = Math.ceil(cal_perday_fat / numOfMeal);
	var cal_permeals_carbohydrate = Math.ceil(cal_perday_carbohydrate / numOfMeal);

	var div_permeals_protein = Math.round(cal_permeals_protein / totalCaloriesPerMeal * 100);
	var div_permeals_fat = Math.round(cal_permeals_fat / totalCaloriesPerMeal * 100);
	var div_permeals_carbohydrate = Math.round(cal_permeals_carbohydrate / totalCaloriesPerMeal * 100);

	var valCadio = 0; //การคาร์ดิโอ
	var valCarbohydrate = 0; //คาร์โบไฮเดตรต้องลด
	var loseweight = 0; //น้ำหนักที่จะ เพิ่ม/ลด ได้
	var energy_weight_loss = 0; //ค่าพลังงานสำหรับเพิ่มกล้ามเนื้อ/น้ำหนัก

	if (goal === 'loseWeight') {
		if (goalOption === 'normal') {
			valCadio = Math.ceil(maintain * 10 / 100 / 2);
			valCarbohydrate = Math.ceil(maintain * 10 / 100 / 4 / 7 / 2);
			loseweight = Math.round(mainTDEE * 10 / 100 * 0.000143 * 7 * 10) / 10;
			energy_weight_loss = Math.floor(mainTDEE - mainTDEE * 10 / 100);
		} else {
			valCadio = 200;
			valCarbohydrate = 75;
			loseweight = 0.5;
			energy_weight_loss = mainTDEE - 500;
		}
	} else {
		if (goalOption === 'normal') {
			valCadio = 0;
			valCarbohydrate = Math.ceil(maintain * 10 / 100 / 4 / 7);
			loseweight = Math.round(mainTDEE * 10 / 100 * 0.000143 * 7);
			energy_weight_loss = Math.floor(mainTDEE * 1.1);
		} else {
			valCadio = 0;
			valCarbohydrate = 125;
			loseweight = 0.5;
			energy_weight_loss = mainTDEE + 500;
		}
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
		carb: nutrients.carb,
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