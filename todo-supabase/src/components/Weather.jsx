import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/Weather.module.css';

const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_KEY;

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [weatherIconUrl, setWeatherIconUrl] = useState('');
  const [iconCode, setIconCode] = useState('');

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
      setWeatherData(data);

      const iconCode = data.weather[0].icon;
      // console.log(iconCode);
      setIconCode(iconCode);
      const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
      setWeatherIconUrl(iconUrl);
    } catch (error) {
      console.error('에러 발생:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

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
          <h3 style={{ marginTop: '20px' }}>
            {iconCode === '01d' ? (
              <>
                맑은 날씨!
                <br />
                햇빛이 강하니 외출 시 선크림을 바르세요!
              </>
            ) : (
              ''
            )}
          </h3>
          <h3 style={{ marginTop: '20px' }}>
            {iconCode === '02d' ? (
              <>
                약간의 구름!
                <br />
                햇빛이 약하니 야외 활동에 문제가 없습니다!
              </>
            ) : (
              ''
            )}
          </h3>
          <h3 style={{ marginTop: '20px' }}>
            {iconCode === '03d' ? (
              <>
                부분적 흐림!
                <br />
                날이 흐리지만 모두들 화이팅입니다!
              </>
            ) : (
              ''
            )}
          </h3>
          <h3 style={{ marginTop: '20px' }}>
            {iconCode === '04d' ? (
              <>
                흐린 하늘!
                <br />
                비가 올 수 있으니 우산을 챙기는 걸 추천합니다!
              </>
            ) : (
              ''
            )}
          </h3>
          <h3 style={{ marginTop: '20px' }}>
            {iconCode === '09d' ? (
              <>
                소나기!
                <br />
                외출 시에 꼭 우산을 챙기세요!
              </>
            ) : (
              ''
            )}
          </h3>
          <h3 style={{ marginTop: '20px' }}>
            {iconCode === '10d' ? (
              <>
                비 소식!
                <br />
                우산을 챙기시고 운전을 조심하세요!
              </>
            ) : (
              ''
            )}
          </h3>
          <h3 style={{ marginTop: '20px' }}>
            {iconCode === '11d' ? (
              <>
                천둥번개!
                <br />
                외출을 자제하세요!
              </>
            ) : (
              ''
            )}
          </h3>
          <h3 style={{ marginTop: '20px' }}>
            {iconCode === '13d' ? (
              <>
                눈!
                <br />
                미끄럽지 않은 신발을 착용하고 운전을 조심하세요!
              </>
            ) : (
              ''
            )}
          </h3>
          <h3 style={{ marginTop: '20px' }}>
            {iconCode === '50d' ? (
              <>
                안개!
                <br />
                시야가 흐리니 항상 조심하세요!
              </>
            ) : (
              ''
            )}
          </h3>
        </div>
      ) : error ? (
        <p className={styles.error}>에러: {error}</p>
      ) : (
        <p className={styles.loading}>날씨 정보를 불러오는 중...</p>
      )}
    </div>
  );
};

export default Weather;
