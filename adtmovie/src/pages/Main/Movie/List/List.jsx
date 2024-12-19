import { useNavigate } from 'react-router-dom';
import './List.css';
import { useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../../context/context';

const Lists = () => {
  const navigate = useNavigate();
  const {lists} = useContext(AuthContext);
  const { setListDataMovie } = useContext(AuthContext);
  const { auth } = useContext(AuthContext);


  const getMovies = useCallback(() => {
    // Get the movies from the API or database
    axios.get('/movies').then((response) => {
        setListDataMovie(response.data);
    });
}, [setListDataMovie]);

  useEffect(() => {
    getMovies();
  }, [getMovies]);

  const handleDelete = (id) => {
    const isConfirm = window.confirm(
      'Are you sure that you want to delete this data?'
    );
    if (isConfirm) {
      axios
        .delete(`/movies/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        })
        .then(() => {
          //update list by modifying the movie list array
          const tempLists = [...lists];
          const index = lists.findIndex((movie) => movie.id === id);
          if (index !== undefined || index !== -1) {
            tempLists.splice(index, 1);
            setListDataMovie(tempLists);
          }
        }).catch((err) => {
          console.log(err);
          //update list by requesting again to api
          // getMovies();
        });
    }
  };

  return (
    <div className='lists-container'>
      <div className='create-container'>
        <button
          className="create-button"
          type='button'
          onClick={() => {
            navigate('/main/movies/form');
          }}
        >
          Create new
        </button>
      </div>
      <div className='table-container'>
        <table className='movie-lists'>
          <thead>
            <tr>
              <th>No.</th>
              <th>ID</th>
              <th>Title</th>
              <th>TmdbID</th>
              <th>Popularity</th>
              <th>Release Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
                  {lists.map((movie, index) => (
                    <tr key={movie.id}>
                      <td>{index + 1}</td>
                      <td>{movie.id}</td>
                      <td>{movie.title}</td>
                      <td>{movie.tmdbId}</td>
                      <td>{movie.popularity}</td>
                      <td>{movie.dateCreated}</td>
                      <td>
                        <button
                          className="create-button"
                          type="button"
                          onClick={() => {
                            navigate("/main/movies/form/" + movie.id + '/cast-and-crews/' + movie.tmdbId);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="create-button delete"
                          type="button"
                          onClick={() => handleDelete(movie.tmdbId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
        </table>
      </div>
    </div>
  );
};

export default Lists;