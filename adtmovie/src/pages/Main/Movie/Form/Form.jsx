import axios from 'axios';
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../../../context/context';
import './Form.css';

const Form = () => {
    const { auth } = useContext(AuthContext);
    const [query, setQuery] = useState(''); 
    const [searchedMovieList, setSearchedMovieList] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(undefined);
    const [notfound, setNotFound] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pagebtn, setPageBtn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    let { movieId } = useParams();
    const selectorRef = useRef();
    let { id } = useParams();
    const { setMovieInfo } = useContext(AuthContext);
    const tabset = JSON.parse(localStorage.getItem('tab'));
    const [tab, setTab] = useState(tabset);

    useEffect(() => {
        tabselector();
    })

    const tabselector = () => {
        const castTab = document.querySelector('.cast-tab');
        const videoTab = document.querySelector('.video-tab');
        const photoTab = document.querySelector('.photo-tab');

        switch (tab) {
            case 'cast':
                if (castTab) {
                    castTab.style.backgroundColor = '#0047ab';
                    videoTab.style.backgroundColor = '';
                    photoTab.style.backgroundColor = '';
                }
                break;
            case 'video':
                if (videoTab) {
                    videoTab.style.backgroundColor = '#0047ab';
                    castTab.style.backgroundColor = '';
                    photoTab.style.backgroundColor = '';
                }
                break;
            case 'photo':
                if (photoTab) {
                    photoTab.style.backgroundColor = '#0047ab';
                    videoTab.style.backgroundColor = '';
                    castTab.style.backgroundColor = '';
                }
                break;
            default:
        }
    
        localStorage.setItem('tab', JSON.stringify(tab));
    }


    const handleSearch = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios({
                method: 'get',
                url: `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=${page}`,
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZjQ4ZTE2MGZmMWUyMzNjZWJmMDBmNjc4MmU3ZDBkZCIsIm5iZiI6MTczMjgwNzA5OC4yNTgyMDQ3LCJzdWIiOiI2NzQ4ODdhODU0MzQzODhlMWE1OGFhMjQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0._14QiHZ1YuPBAdadW1XjbsNfXLCYSGnLv9u381L2Oho',
                },
            });

            if (response.data.results.length === 0) {
                console.log("Not Found");
                setNotFound(true);
                setSearchedMovieList([]);
                setTotalPages(0);
                setPageBtn(false);
            } else {
                setSearchedMovieList(response.data.results);
                setTotalPages(response.data.total_pages);
                setNotFound(false);
                setPageBtn(true);
            }
        } catch (err) {
            setError('Error fetching movies. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    const handleSelectMovie = (movie) => {
        setSelectedMovie(movie);
    };

    const handleSave = async () => {
        if (!selectedMovie) {
            alert('Please search and select a movie.');
            return;
        }

        
        try {
            if (movieId) {
            
                const data = {
                    tmdbId: selectedMovie.id,
                    title: selectedMovie.title,
                    overview: selectedMovie.overview,
                    popularity: selectedMovie.popularity,
                    releaseDate: selectedMovie.release_date,
                    voteAverage: selectedMovie.vote_average,
                    backdropPath: selectedMovie.backdrop_path,
                    posterPath: selectedMovie.poster_path,
                    isFeatured: selectedMovie.isFeatured,
                };
                await axios({
                    method: 'PATCH',
                    url: `/movies/${movieId}`,
                    data: data,
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                });
                alert('Update Success');
            } else {
                if (!selectorRef.current.value.trim()) {
                    selectorRef.current.style.border = '2px solid red';
                    setTimeout(() => {
                        selectorRef.current.style.border = '1px solid #ccc';
                    }, 2000);
                    return;
                }
                
                const data = {
                    tmdbId: selectedMovie.id,
                    title: selectedMovie.title,
                    overview: selectedMovie.overview,
                    popularity: selectedMovie.popularity,
                    releaseDate: selectedMovie.release_date,
                    voteAverage: selectedMovie.vote_average,
                    backdropPath: `https://image.tmdb.org/t/p/original/${selectedMovie.backdrop_path}`,
                    posterPath: `https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`,
                    isFeatured: selectedMovie.isFeatured,
                };
                await axios({
                    method: 'post',
                    url: '/movies',
                    data: data,
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                });
                alert('Save Success');
            }
            navigate('/main/movies');
        } catch (err) {
            setError('Error saving movie. Please try again later.');
            console.error(err);
        }
    };

    useEffect(() => {
        if (movieId) {
            const fetchMovie = async () => {
                try {
                    const response = await axios.get(`/movies/${movieId}`);
                    setMovieInfo(response.data);
                    setSelectedMovie({
                        id: response.data.tmdbId,
                        tmdbId: response.data.id,
                        title: response.data.title,
                        overview: response.data.overview,
                        popularity: response.data.popularity,
                        backdrop_path: response.data.backdropPath,
                        poster_path: response.data.posterPath,
                        release_date: response.data.releaseDate,
                        vote_average: response.data.voteAverage,
                        isFeatured: response.data.isFeatured,
                    });
                } catch (err) {
                    setError('Error fetching movie details. Please try again later.');
                    console.error(err);
                }
            };

            fetchMovie();
        }
    }, [movieId, setMovieInfo, setSelectedMovie]);

    return (
        <div className="moviecontainer mt-5 overflow-auto movieform-container">
    <h2 className="movieform-title">{movieId ? 'Edit ' : 'Create '} Movie</h2>

    {error && <p className="text-center text-danger">{error}</p>}

    {movieId === undefined && (
        <>
            <div className="search-container">
                <div className="movieform-group">
                    <label className='search-label'>Search Movie </label>
                    <div className="d-flex">
                        <input
                            type="text"
                            className="movieform-control me-2 search-input"
                            onChange={(event) => {
                                setQuery(event.target.value);
                                        setNotFound(false);
                                        setSearchedMovieList([]);
                                        setSelectedMovie(undefined);
                                        setCurrentPage(1);
                                        setPageBtn(false);
                            }}
                            placeholder="Enter movie title"
                        />
                        <button
                            type="button"
                            className="moviebtn btn-primary search-button"
                            onClick={() => handleSearch(1)}
                        >
                            Search
                        </button>
                    </div>
                </div>

                <div className="searched-movie mt-3">
                    {notfound ? (
                        <p className="text-center text-white bg-danger p-2 rounded not-found-message">
                            Movie not found
                        </p>
                    ) : isLoading ? (
                        <p className="text-center">Searching...</p>
                    ) : (
                        searchedMovieList.map((movie) => (
                            <p
                                key={movie.id}
                                className="border p-2 movie-item"
                                onClick={() => handleSelectMovie(movie)}
                            >
                                {movie.original_title}
                            </p>
                        ))
                    )}
                </div>
            </div>

            {totalPages > 0 && !notfound && pagebtn && (
                <div className="pagination-container">
                    <button
                        className="moviebtn btn-secondary prev-button"
                        onClick={() => {
                            if (currentPage > 1) {
                                handleSearch(currentPage - 1);
                                setCurrentPage(currentPage - 1);
                            }
                        }}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        className="moviebtn btn-secondary next-button"
                        onClick={() => {
                            if (currentPage < totalPages) {
                                handleSearch(currentPage + 1);
                                setCurrentPage(currentPage + 1);
                            }
                        }}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    )}

<div className="movie-details-container">
    <div className="row">
        <div className="col-md-6 poster-col">
            {selectedMovie && (
                <img
                    className="img-fluid poster-image mb-3"
                    src={selectedMovie?.poster_path
                        ? `https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`
                        : require('./../../../../')}
                    alt={selectedMovie?.title}
                />
            )}
        </div>

        <div className="col-md-6 movie-details">
            <form className='form-mvdetails'>
                <div className="movieform-group">
                    <label>Title</label>
                    <input
                        type="text"
                        className="movieform-control"
                        value={selectedMovie ? selectedMovie.title : ''}
                        onChange={(e) => setSelectedMovie({ ...selectedMovie, title: e.target.value })}
                        disabled={movieId === undefined}
                    />
                </div>

                <div className="movieform-group">
                    <label>Overview</label>
                    <textarea
                        className="movieform-control"
                        rows={5}
                        value={selectedMovie ? selectedMovie.overview : ''}
                        onChange={(e) => setSelectedMovie({ ...selectedMovie, overview: e.target.value })}
                        disabled={movieId === undefined}
                    />
                </div>

                <div className="movieform-group">
                    <label>Popularity</label>
                    <input
                        type="number"
                        className="movieform-control"
                        value={selectedMovie ? selectedMovie.popularity : ''}
                        onChange={(e) => setSelectedMovie({ ...selectedMovie, popularity: e.target.value })}
                        step={0.1}
                        disabled={movieId === undefined}
                    />
                </div>

                <div className="movieform-group">
                    <label>Release Date</label>
                    <input
                        type="date"
                        className="movieform-control"
                        value={selectedMovie ? selectedMovie.release_date : ''}
                        onChange={(e) => setSelectedMovie({ ...selectedMovie, release_date: e.target.value })}
                        disabled={movieId === undefined}
                    />
                </div>

                <div className="movieform-group">
                    <label>Vote Average</label>
                    <input
                        type="number"
                        className="movieform-control"
                        value={selectedMovie ? selectedMovie.vote_average : ''}
                        onChange={(e) => setSelectedMovie({ ...selectedMovie, vote_average: e.target.value })}
                        step={0.1}
                        disabled={movieId === undefined}
                    />
                </div>
                <label className='featured'>Is Featured</label>
                        <select
                            className="seletor-feature"
                            value={selectedMovie && typeof selectedMovie.isFeatured === "boolean"
                                ? (selectedMovie.isFeatured ? "Yes" : "No")
                                : ""}
                            onChange={(e) =>
                                setSelectedMovie({
                                    ...selectedMovie,
                                    isFeatured: e.target.value === "Yes"
                                })
                            }
                            ref={selectorRef}
                        >
                            <option value="" disabled>
                                Select an option
                            </option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                <div className="movieform-group">
                    <button
                        type="button"
                        className="save-button btn-success"
                        onClick={handleSave}
                        enabled={!selectedMovie}
                    >
                        {movieId ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
        <div className="additional-info-container">
        {movieId !== undefined && selectedMovie && (
            <>
                <nav>
                    <ul className="tabs">
                        <li className='cast-tab' onClick={() => {setTab('cast') 
                            navigate(`/main/movies/form/${id}/cast-and-crews/${movieId}`);
                            }}
                            onChange={tabselector}
                            >Cast & Crews</li>
                        <li className='video-tab' 
                        onClick={() => {
                            setTab('video')
                            navigate(`/main/movies/form/${id}/videos/${movieId}`);
                            }}
                            onChange={tabselector}
                            >
                            Videos</li>
                        <li className='photo-tab' onClick={() => {
                            setTab('photo')
                            navigate(`/main/movies/form/${id}/photos/${movieId}`);
                            }}
                            onChange={tabselector}
                            >Photos</li>
                    </ul>
                </nav>
                <div className="tabs-content">
                    <Outlet />
                </div>
            </>
        )}
    </div>
</div>
    </div>
</div>


    );
};

export default Form;