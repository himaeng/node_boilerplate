import { version } from '../../package.json';
import { Router } from 'express';

export default () => {
	let api = Router();

	api.get('/we', (req, res) => {
		const data = format(req.query);
		console.log('body get: ', req.body);
		console.log('query get: ', req.query);
		const {
			main_tdee,
			energy_weight_loss,
			loseweight

		} = calTDEE(data);

		res.json({
			messages: [
				{
					text: `
						ข้อมูลส่วนตัว
						ค่่่่่่่่าพลังงานที่ทำให้น้ำหนักคงที่(TDEE) ${main_tdee}
						ค่าพลังงานใหม่สำหรับเพิ่ม/ลดน้ำหนัก ${energy_weight_loss}
						น้ำหนักของคุณจะเพิ่ม/ลดสัปดาห์ละ ${loseweight}
						`
				}
			]
		});
	});

	api.get('/', (req, res) => {
		res.json({ version });
	});

	// perhaps expose some API metadata at the root
	api.post('/', (req, res) => {
		const data = format(req.body);
		console.log('body: ', req.body);
		console.log('query: ', req.query);
		const {
			main_tdee,
			energy_weight_loss,
			loseweight

		} = calTDEE(data);

		res.json({
			messages: [
				{
					text: `
						ข้อมูลส่วนตัว
						ค่่่่่่่่าพลังงานที่ทำให้น้ำหนักคงที่(TDEE) ${main_tdee}
						ค่าพลังงานใหม่สำหรับเพิ่ม/ลดน้ำหนัก ${energy_weight_loss}
						น้ำหนักของคุณจะเพิ่ม/ลดสัปดาห์ละ ${loseweight}
						`
				}
			]
		});
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
		case 'เพิ่มน้ำหนัก':
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
	console.log('maintain: ', maintain);
	const nutrients = calNutrient(percentFat, weight, maintain, goal, goalOption);
	console.log('nutrients: ', nutrients);

	const mainTDEE = (nutrients.protein * 4) + (Math.floor(((maintain - (nutrients.protein * 4) - (nutrients.fat * 9)) / 4)) * 4) + (nutrients.fat * 9);
	console.log('mainTDEE: ', mainTDEE);

	//รวมแคลอรี่
	const totalCalories = (nutrients.protein * 4) + (nutrients.carb * 4) + (nutrients.fat * 9);
	const totalCaloriesPerMeal = Math.ceil(totalCalories / numOfMeal);

	//ต่อวัน
	const cal_perday_protein = nutrients.protein * 4;
	const cal_perday_fat = nutrients.fat * 9;
	const cal_perday_carbohydrate = nutrients.carb * 4;

	const div_perday_protein = Math.round(cal_perday_protein / totalCalories, -2) * 100;
	const div_perday_fat = Math.round(cal_perday_fat / totalCalories, -2) * 100;
	const div_perday_carbohydrate = Math.round(cal_perday_carbohydrate / totalCalories, -2) * 100;
	
	//ต่อมื้อ
	const permeals_protein = Math.ceil(nutrients.protein / numOfMeal);
	const permeals_fat = Math.ceil(nutrients.fat / numOfMeal);
	const permeals_carbohydrate = Math.ceil(nutrients.carb / numOfMeal);

	const cal_permeals_protein = Math.ceil(cal_perday_protein / numOfMeal);
	const cal_permeals_fat = Math.ceil(cal_perday_fat / numOfMeal);
	const cal_permeals_carbohydrate = Math.ceil(cal_perday_carbohydrate / numOfMeal);

	const div_permeals_protein = Math.round(cal_permeals_protein / totalCaloriesPerMeal, -2) * 100;
	const div_permeals_fat = Math.round(cal_permeals_fat / totalCaloriesPerMeal, -2) * 100;
	const div_permeals_carbohydrate = Math.round(cal_permeals_carbohydrate / totalCaloriesPerMeal, -2) * 100;

	//การคาร์ดิโอ และคาร์โบไฮเดตรต้องลด
	let valCadio = Math.ceil((maintain * 10 / 100) / 2);
	let valCarbohydrate = Math.ceil((maintain * 10 / 100) / 4 / 7 / 2);
	
	//น้ำหนักที่จะเพิ่มได้
	let loseweight = Math.round(((mainTDEE * 10 / 100) * 0.000143 * 7),1);
	
	//ค่าพลังงานสำหรับเพิ่มกล้ามเนื้อ/น้ำหนัก
	let energy_weight_loss = Math.floor(mainTDEE - (mainTDEE * 10 / 100));

	//แบบค่อยเป็นค่อยไป
	if(goalOption === 'normal'){
		valCadio = 0; 
		valCarbohydrate = Math.ceil((maintain * 10 / 100) / 4 / 7);
		
		//น้ำหนักที่จะเพิ่มได้
		loseweight = Math.round(((mainTDEE * 10 / 100) * 0.000143 * 7) * 10) / 10;
		
		//ค่าพลังงานสำหรับเพิ่มกล้ามเนื้อ/น้ำหนัก
		energy_weight_loss = Math.floor((mainTDEE * 1.1));
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
  }
}