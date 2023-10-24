import React from 'react';
import {  useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateSearchCategory, updateFetchedData, updateActive } from '../redux/slices/searchCategorySlice.js';
import { updateTitle } from '../redux/slices/titleSlice.js';
import { updateToast } from '../redux/slices/toastSlice.js';
import { updateTabs } from '../redux/slices/tabsSlice.js';
import { toastObjFactory, bookObjFactory } from '../helpers/indexHelpers.js';

const SearchBar = () => {

	const dispatch = useDispatch();
	const searchCategory = useSelector(state => state.category.category);
	const isActive = useSelector(state => state.category.active);
	const tab = useSelector(state => state.tabs);
	const navigate = useNavigate();

	const setSearchCategory = (cat, num) => {
		dispatch(updateSearchCategory(cat));
		dispatch(updateActive(num));
	}

	const handleSearch = async (e) => {
		e.preventDefault();
		const local = 'http://localhost:5000/data';
		const searchTerms = e.target.searchTerms.value.trim();
		const queryParams = new URLSearchParams({
			searchTerms: searchTerms,
			searchCategory: searchCategory
		})
		const url = `${local}?${queryParams}`;
		
		try {
			const response = await fetch(url, { method: 'GET' });
			if (!response.ok) {
				throw new Error('Network response was not ok.');
			}

			const rawData = await response.json();
			const objToArr = rawData.data.items || [];
			const parsedArr = objToArr.map(book => bookObjFactory(book));
			const title = rawData.title.genre;
			dispatch(updateFetchedData(parsedArr));
			dispatch(updateTitle(title));
			e.target.searchTerms.value = null;
			if(tab !== 0) {
				dispatch(updateTabs(0));
				return navigate("/")
			}
		} catch (error) {
			dispatch(updateToast(toastObjFactory("warning", `${error.message}`)));
		}
	}

	return (
		<div className="container ">
			<p className="app__sub-font mt-4 mb-3">Search...</p>
			<form className="d-flex flex-column needs-validation" onSubmit={handleSearch}>
				<div
					className="btn-group mb-3"
					role="group"
					aria-label="Basic radio toggle button group"
				>
					<input
						type="radio"
						className="btn-check"
						name="title"
						id="btnradio1"
						autoComplete="off"
						checked={isActive === 0}
						onChange={() => setSearchCategory('title', 0)}
					></input>
					<label className="btn btn-secondary" htmlFor="btnradio1">
						Title
					</label>

					<input
						type="radio"
						className="btn-check"
						name="author"
						id="btnradio2"
						autoComplete="off"
						checked={isActive === 1}
						onChange={() => setSearchCategory('author', 1)}
					></input>
					<label className="btn btn-secondary" htmlFor="btnradio2">
						Author
					</label>

					<input
						type="radio"
						className="btn-check"
						name="genre"
						id="btnradio3"
						autoComplete="off"
						checked={isActive === 2}
						onChange={() => setSearchCategory('genre', 2)}
					></input>
					<label className="btn btn-secondary" htmlFor="btnradio3">
						Genre
					</label>
				</div>
				<div className="input-group has-validation">
					<input
						type="text"
						className="form-control"
						placeholder={`${searchCategory}...`}
						aria-label="Username"
						aria-describedby="basic-addon1"
						name='searchTerms'
					></input>
					<button
						className="btn btn-secondary"
						type="submit"
					>
						<i className="bi bi-search"></i>
					</button>
					<div className="valid-feedback">Looks good!</div>
					<div className="invalid-feedback">Enter Search Term.</div>
				</div>
			</form>
		</div>
	);
};

export default SearchBar;
