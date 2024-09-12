import React, { useEffect, useCallback, useReducer } from 'react';
import styles from '../styles/Weather.module.css';

const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_KEY;

const initialState = {
  weatherData: null,
  error: null,
  weatherIconUrl: '',
  iconCode: '',
};
const reducer = (state, action) => {
  switch (action.type) {
    case 'WEATHER_DATA':
      return { ...state, weatherData: action.payload };
    case 'ERROR':
      return { ...state, error: action.payload };
    case 'WEATHER_URL':
      return { ...state, weatherIconUrl: action.payload };
    case 'ICON_CODE':
      return { ...state, iconCode: action.payload };
    default:
      return state;
  }
};

const Weather = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { weatherData, error, weatherIconUrl, iconCode } = state;

  const getCurrentLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherByCurrentLocation(lat, lon);
    });
  }, []);

  const getWeatherByCurrentLocation = async (lat, lon) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Failed to get Weather info.');

      const data = await response.json();
      dispatch({ type: 'WEATHER_DATA', payload: data });

      const iconCode = data.weather[0].icon;
      // console.log(iconCode);
      // setIconCode(iconCode);
      dispatch({ type: 'ICON_CODE', payload: iconCode });
      const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
      // setWeatherIconUrl(iconUrl);
      dispatch({ type: 'WEATHER_URL', payload: iconUrl });
    } catch (error) {
      console.error('에러 발생:', error);
      dispatch({ type: 'ERROR', payload: error.message });
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const weatherMessages = {
    '01d': {
      message: '맑은 날씨! 햇빛이 강하니 외출 시 선크림을 바르세요!',
    },
    '02d': {
      message: '약간의 구름! 햇빛이 약하니 야외 활동에 문제가 없습니다!',
    },
    '03d': {
      message: '부분적 흐림! 날이 흐리지만 모두들 화이팅입니다!',
    },
    '04d': {
      message: '흐린 하늘! 비가 올 수 있으니 우산을 챙기는 걸 추천합니다!',
    },
    '09d': {
      message: '소나기! 외출 시에 꼭 우산을 챙기세요!',
    },
    '10d': {
      message: '비 소식! 우산을 챙기시고 운전을 조심하세요!',
    },
    '11d': {
      message: '천둥번개! 외출을 자제하세요!',
    },
    '13d': {
      message: '눈! 미끄럽지 않은 신발을 착용하고 운전을 조심하세요!',
    },
    '50d': {
      message: '안개! 시야가 흐리니 항상 조심하세요!',
    },
  };

  return (
    <div className={styles.weatherContainer}>
      <h2 className={styles.weatherHeader}>
        {weatherData
          ? `${weatherData.name}의 날씨`
          : '날씨 정보를 불러오는 중...'}
      </h2>
      {weatherData ? (
        <div className={styles.weatherDetails}>
          <img
            src={weatherIconUrl}
            alt="Weather icon"
            className={styles.weatherIcon}
          />
          <p>온도: {weatherData.main.temp}°C</p>
          <p>습도: {weatherData.main.humidity}%</p>
          <p>바람 세기: {weatherData.wind.speed}</p>
          <hr />
          {iconCode in weatherMessages && (
            <h3 style={{ marginTop: '20px' }}>
              {weatherMessages[iconCode].message}
            </h3>
          )}
        </div>
      ) : error ? (
        <p className={styles.error}>에러: {error}</p>
      ) : (
        <p className={styles.loading}>잠시만 기다려주세요 !</p>
      )}
    </div>
  );
};

export default Weather;
