import { version } from '../../package.json';
import { Router } from 'express';

export default () => {
	let api = Router();

	api.get('/', (req, res) => {
		const data = format(req.query);
		console.log('query get: ', req.query);
		console.log('data get: ', data);

		const {
			main_tdee,
			energy_weight_loss,
			loseweight,
			valCadio,
			minHeartRate,
			maxHeartRate,
			cadioperweek,
			//ต่อวัน
			protein, // day_protein
			cal_perday_protein,
			div_perday_protein,
			carb,
			cal_perday_carbohydrate,
			div_perday_carbohydrate,
			fat,
			cal_perday_fat,
			div_perday_fat,
			totalCalories, // รวมแคลลอรี่
			// ต่อมื้อ
			permeals_protein,
			cal_permeals_protein,
			div_permeals_protein,
			permeals_carbohydrate,
			cal_permeals_carbohydrate,
			div_permeals_carbohydrate,
			permeals_fat,
			cal_permeals_fat,
			div_permeals_fat,
			totalCaloriesPerMeal //รวมแคลลอรี่
		} = calTDEE(data);

		//res.json(calTDEE(data));
		const word = (req.query.goal === 'เพิ่มกล้ามเนื้อ') ? 'เพิ่ม' : 'ลด';

		res.json({
			messages: [
				{
					text: `ผลการคำนวณ`
				},
				{
					text: `เป้าหมาย: ${req.query.goal}\nค่าพลังงานที่ทำให้น้ำหนักคงที่(TDEE) ${main_tdee}\nค่าพลังงานใหม่สำหรับ${req.query.goal} ${energy_weight_loss}แคลอรี่\nน้ำหนักของคุณจะ${word}สัปดาห์ละ ${loseweight} กิโลกรัม`
				},
				{
					text: `โปรแกรมคาร์ดิโอ`
				},
				{
					text: `จำนวนเวลาที่คาร์ดิโอ ${valCadio} นาทีต่อสัปดาห์\nอัตราการเต้นของหัวใจ ${minHeartRate} - ${maxHeartRate} ครั้ง/นาที\nแคลลอรี่จากการคาร์ดิโอ/สัปดาห์ ${cadioperweek}`
				},
				{
					text: `โปรแกรมอาหารต่อวัน`
				},
				{
					text: `โปรตีน ปริมาณ ${protein} กรัม คิดเป็น ${cal_perday_protein} หรือ ${div_perday_protein} %\nคาร์โบไฮเดรต ปริมาณ ${carb} กรัม คิดเป็น ${cal_perday_carbohydrate} หรือ ${div_perday_carbohydrate} %\nไขมัน ปริมาณ ${fat} กรัม คิดเป็น ${cal_perday_fat} หรือ ${div_perday_fat} %`
				},
				{
					text: `โปรแกรมอาหารต่อมื้อ`
				},
				{
					text: `โปรตีน ปริมาณ ${permeals_protein} กรัม คิดเป็น ${cal_permeals_protein} หรือ ${div_permeals_protein} %\nคาร์โบไฮเดรต ปริมาณ ${permeals_carbohydrate} กรัม คิดเป็น ${cal_permeals_protein} หรือ ${div_permeals_protein} %\nไขมัน ปริมาณ ${permeals_fat} กรัม คิดเป็น ${cal_perday_fat} หรือ ${div_permeals_fat} %`
				}
			]
		});
	});

	api.get('/v', (req, res) => {
		res.json({ version });
	});

	return api;
}

const formatWorkoutFrequency = (weightFrequency) => {
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
}

const formatNumofMeal = (food) => {
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
}

const formatGoal = (goal) => {
	switch (goal) {
		case 'ลดน้ำหนัก':
			return 'loseWeight';
		case 'เพิ่มกล้ามเนื้อ':
			return 'muscleGain';
	}
}

const formatGoalOption = (goalType) => {
	switch (goalType) {
		case 'ปกติ':
			return 'normal';
		case 'เร่งด่วน':
			return 'quick';
	}
}

const format = ({ gender, age, height, weight, fat, weightFrequency, food, goal, goalType }) => {

	const workoutFrequency = formatWorkoutFrequency(weightFrequency);
	const numOfMeal = formatNumofMeal(food);
	const goalFormated = formatGoal(goal);
	const goalOption = formatGoalOption(goalType);

	return {
		gender,
		age: parseInt(age),
		height: parseInt(height), 
		weight: parseInt(weight), 
		percentFat: parseInt(fat), 
		workoutFrequency, 
		goal: goalFormated,
		goalOption, 
		numOfMeal
	}
}

const calMaintain = (gender, weight, height, age, percentFat, workoutFrequency) => {
	let result = 0;
  const commonFormula = (10 * weight) + (6.25 * height) - (5 * age);

  if (percentFat === 0) {
    result = (gender === "male") ? commonFormula + 5 : commonFormula - 162; 
  } else {
    const leanMass = weight - (weight * percentFat / 100);
    //const leanMassLbs = leanMass * 2.2;
    result = (21.6 * leanMass) + 370;
  }

  return Math.round(result * workoutFrequency);
}

function calNutrient(percentFat, weight, maintain, goal, goalOption) {
	const protein = Math.ceil(0.95 * 2.2 * weight);
	const fat = Math.ceil(0.375 * 2.2 * weight);
	const formulaCarbOne = (goal === 'loseWeight') 
		? (maintain * 0.1) / 2 / 4 
		: (maintain * 0.1) / 4;
	const formulaCarbTwo = (percentFat === 0) 
		? Math.ceil(formulaCarbOne) 
		: Math.floor(formulaCarbOne);
	const commonFormulaCarb = Math.floor(((maintain - (protein * 4) - (fat * 9)) / 4));
	const carb = (goalOption === 'normal')
		? commonFormulaCarb - formulaCarbTwo
		: commonFormulaCarb + 125;

  return { protein, carb, fat };
}

function calTDEE({ gender, age, height, weight, percentFat, workoutFrequency, goal, goalOption, numOfMeal }) {
  const maintain = calMaintain(gender, weight, height, age, percentFat, workoutFrequency);
	//console.log('maintain: ', maintain);
	const nutrients = calNutrient(percentFat, weight, maintain, goal, goalOption);
	//console.log('nutrients: ', nutrients);

	const mainTDEE = (nutrients.protein * 4) + (Math.floor(((maintain - (nutrients.protein * 4) - (nutrients.fat * 9)) / 4)) * 4) + (nutrients.fat * 9);
	//console.log('mainTDEE: ', mainTDEE);

	//รวมแคลอรี่
	const totalCalories = (nutrients.protein * 4) + (nutrients.carb * 4) + (nutrients.fat * 9);
	const totalCaloriesPerMeal = Math.ceil(totalCalories / numOfMeal);

	//ต่อวัน
	const cal_perday_protein = nutrients.protein * 4;
	const cal_perday_fat = nutrients.fat * 9;
	const cal_perday_carbohydrate = nutrients.carb * 4;

	const div_perday_protein = Math.round((cal_perday_protein / totalCalories * 100));
	const div_perday_fat = Math.round((cal_perday_fat / totalCalories * 100));
	const div_perday_carbohydrate = Math.round((cal_perday_carbohydrate / totalCalories * 100));
	
	//ต่อมื้อ
	const permeals_protein = Math.ceil(nutrients.protein / numOfMeal);
	const permeals_fat = Math.ceil(nutrients.fat / numOfMeal);
	const permeals_carbohydrate = Math.ceil(nutrients.carb / numOfMeal);

	const cal_permeals_protein = Math.ceil(cal_perday_protein / numOfMeal);
	const cal_permeals_fat = Math.ceil(cal_perday_fat / numOfMeal);
	const cal_permeals_carbohydrate = Math.ceil(cal_perday_carbohydrate / numOfMeal);

	const div_permeals_protein = Math.round(cal_permeals_protein / totalCaloriesPerMeal * 100);
	const div_permeals_fat = Math.round(cal_permeals_fat / totalCaloriesPerMeal * 100);
	const div_permeals_carbohydrate = Math.round(cal_permeals_carbohydrate / totalCaloriesPerMeal * 100);

	let valCadio = 0; //การคาร์ดิโอ
	let valCarbohydrate = 0; //คาร์โบไฮเดตรต้องลด
	let loseweight = 0; //น้ำหนักที่จะ เพิ่ม/ลด ได้
	let energy_weight_loss = 0; //ค่าพลังงานสำหรับเพิ่มกล้ามเนื้อ/น้ำหนัก

	if (goal === 'loseWeight') {
		if (goalOption === 'normal') {
			valCadio = Math.ceil((maintain * 10 / 100) / 2);
			valCarbohydrate = Math.ceil((maintain * 10 / 100) / 4 / 7 / 2);
			loseweight = Math.round(((mainTDEE * 10 / 100) * 0.000143 * 7) * 10) / 10;
			energy_weight_loss = Math.floor(mainTDEE - (mainTDEE * 10 / 100));
		} else {
			valCadio = 200;
			valCarbohydrate = 75;
			loseweight = 0.5;
			energy_weight_loss = mainTDEE - 500;
		}
	} else {
		if (goalOption === 'normal') {
			valCadio = 0; 
			valCarbohydrate = Math.ceil((maintain * 10 / 100) / 4 / 7);
			loseweight = Math.round(((mainTDEE * 10 / 100) * 0.000143 * 7));
			energy_weight_loss = Math.floor((mainTDEE * 1.1));
		} else {
			valCadio = 0;
			valCarbohydrate = 125;
			loseweight = 0.5;
			energy_weight_loss = mainTDEE + 500;
		}
	}

	//อัตราการเต้นของหัวใจที่เหมาะสม
	const minHeartRate = Math.floor((200 - age) * 60 / 100);
	const maxHeartRate = Math.ceil((200 - age) * 70 / 100);

	//แคลลอรี่จากการคาร์ดิโอ/สัปดาห์
	const cadioperweek = valCadio * 7;

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
  }
}