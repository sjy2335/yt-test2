// 사이트 안의 많은 경로들을 정의해놓은 파일입니다
const express = require("express");
// 구글 api 서비스를 불러오는 패키지
const router = express.Router();

const fs = require('fs');
const path = require('path');

// JSON 파일의 경로를 정의합니다.
const jsonPath = path.resolve('./watchTime.json');

// scrapeRecommendedVideos 함수를 가져옵니다.
const { scrapeRecommendedVideos } = require("../public/scripts/scraper");

function formatTime(timeInSeconds) {
  const hours = (timeInSeconds / 3600).toFixed(2);  // round to 2 decimal place
  return hours;
}

// 로그인 창 렌더링, url이 http://localhost:8080/ 일 때 렌더링 됨
router.get("/", function (req, res) {
  res.render("login");
});

// 로그인 이후의 페이지 경로들 입니다
// 영상 창 렌더링, url이 http://localhost:8080/home 일 때 렌더링 됨
router.get("/home", async (req, res) => {
  try {
    // 크롤링하여 추출한 영상 배열
    const videos = await scrapeRecommendedVideos();
    videos.length = 10;
    res.render("videos", { videos });
  } catch (error) {
    console.error("Error:", error);
    res.render("error");
  }
});


router.get("/analysis", async function (req, res) {
  try {
    const currentDate = new Date().toISOString().split('T')[0];  // get current date

    // JSON 파일 동기적으로 읽기
    let data;
    try {
      data = fs.readFileSync(jsonPath, 'utf8');
    } catch (err) {
      console.log(`Error reading file from disk: ${err}`);
    }

    // 파싱하여 JavaScript 객체로 변환
    const database = JSON.parse(data);

    // 오늘의 시청 시간이 이미 있는지 확인
    let todayWatchTime = database.watchTime.find(wt => wt.date === currentDate);
    if (!todayWatchTime) {
      // 오늘의 시청 시간이 없으면 새 항목을 추가합니다.
      todayWatchTime = { date: currentDate, time: 0 };
      database.watchTime.push(todayWatchTime);
    }

    const watchTimeFormatted = formatTime(todayWatchTime.time);

    res.render("analysis", { watchTime: watchTimeFormatted });
  } catch (error) {
    console.error("Error:", error);
    res.render("error");
  }
});


// 시간종료 창 렌더링, url이 http://localhost:8080/end 일 때 렌더링 됨
router.get("/end", function (req, res) {
  res.render("end");
});

router.get('/watchTime', (req, res) => {
  fs.readFile('watchTime.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err); // 에러 로깅
      res.json({ time: 0 }); // 기본값 반환
    } else {
      res.json(JSON.parse(data));
    }
  });
});


router.post('/watchTime', (req, res) => {
  const time  = req.body.time;
  console.log('Received Time: ', time);
  const currentDate = new Date().toISOString().split('T')[0];  // get current date

  // JSON 파일 읽기
  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.log(`Error reading file from disk: ${err}`);
    } else {
      // 파싱하여 JavaScript 객체로 변환
      const database = JSON.parse(data);

      // 오늘의 시청 시간이 이미 있는지 확인
      let todayWatchTime = database.watchTime.find(wt => wt.date === currentDate);
      if (!todayWatchTime) {
        // 오늘의 시청 시간이 없으면 새 항목을 추가합니다.
        todayWatchTime = { date: currentDate, time: 0 };
        database.watchTime.push(todayWatchTime);
      }

      // 시청 시간 추가
      todayWatchTime.time = time;

      // 다시 JSON으로 변환하고 파일에 저장
      fs.writeFile(jsonPath, JSON.stringify(database, null, 2), (err) => {
        if (err) {
          console.log(`Error writing file: ${err}`);
        }
      });
    }
  });

  res.sendStatus(200);
});

module.exports = router;