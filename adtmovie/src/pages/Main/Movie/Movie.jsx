import { Outlet } from 'react-router-dom';
import './Movie.css';

const Movie = () => {
  return (
    <div className="movie-container">
      <div className="movie-content">
        <h1 className="CineMatik-title-movie">CineMatik</h1>
         
        <Outlet/>
      </div>
    </div>
  );
};

export default Movie;
