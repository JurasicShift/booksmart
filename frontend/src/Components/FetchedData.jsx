import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateTitle } from '../redux/slices/titleSlice.js';
import {
	updateFetchedData,
	removeDataItem,
} from '../redux/slices/searchCategorySlice.js';
import {
	bookObjFactory,
	fetcher,
	capitalizer,
	dateProducer,
	gridSpaceSelect,
	marginFactory,
} from '../helpers/indexHelpers.js';
import { addBook } from '../redux/slices/wishSlice.js';
import { addReadBook } from '../redux/slices/readSlice.js';
import { updateTabs } from '../redux/slices/tabsSlice.js';
import useWindowWidth from '../hooks/indexHooks.js';
import FetchLoader from './FetchLoader.jsx';
import { useToast } from '../hooks/indexHooks.js';

const FetchedData = ({ fetchedData }) => {
	const title = useSelector(state => state.title.value);
	const loggedIn = useSelector(state => state.login.active);
	const searchTitle = useSelector(state => state.title.value);
	const width = useWindowWidth();
	const callToast = useToast();

	const navigate = useNavigate();
	const dispatch = useDispatch();

	useEffect(() => {
		if (fetchedData.length > 9) {
			return;
		}

		const fetchData = async () => {
			try {
				const queryParams = new URLSearchParams({
					searchTerms: searchTitle,
					searchCategory: searchTitle,
				});

				const base = 'data';
				const url = fetchedData.length === 9 ? `${base}?${queryParams}` : base;

				const response = await fetcher(url, 'GET');

				if (!response.obj.data || !response.obj.title) {
					throw new Error();
				}

				const objToArr = response.obj.data.items || [];
				const parsedArr =
					fetchedData.length === 9
						? [bookObjFactory(objToArr[0])]
						: objToArr.map(book => bookObjFactory(book));
				const genre = response.obj.title;
				dispatch(updateTitle(genre.genre));
				dispatch(updateFetchedData(parsedArr));
			} catch (e) {
				console.log(`ERROR: ${e}, ERROR MESSAGE: ${e.message}`);
				dispatch(updateTitle('Loading data...'));
				callToast('warning', 'Server not responding');
			}
		};
		fetchData();
	}, [dispatch, fetchedData, callToast, searchTitle]);

	const handleSelection = e => {
		if (!loggedIn)
			return callToast('information', 'Please login or create account');

		const selectionType = e.target.getAttribute('data-button-type');
		const bookId = e.target.getAttribute('data-book-id');
		const bookObj = fetchedData.find(book => book.book_id === bookId);
		if (bookObj) {
			function selector() {
				const newObj = {
					...bookObj,
					date: dateProducer(),
				};
				const selected = [];
				if (selectionType === 'wish') {
					selected.unshift('wishadd', 'POST', bookObj);
				} else {
					selected.unshift('readadd', 'POST', newObj);
				}
				return selected;
			}
			const argumentsArr = selector();

			fetcher(...argumentsArr)
				.then(response => {
					if (!response.obj._id || !response.obj.title) {
						throw new Error();
					}
					dispatch(
						selectionType === 'wish'
							? addBook(response.obj)
							: addReadBook(response.obj)
					);
					dispatch(removeDataItem(response.obj.book_id));
					callToast('success', `${bookObj.title} added to wishlist!`);
					dispatch(updateTabs(selectionType === 'wish' ? 1 : 2));
					return navigate(selectionType === 'wish' ? '/wish' : '/read');
				})
				.catch(error => {
					callToast('warning', `${bookObj.title} failed to hit wishlist!`);
				});
		}
	};

	const imgBase = {
		height: '185px',
		width: '120px',
	};

	const colFlex = {
		display: 'flex',
		justifyContent: 'center',
	};

	const arrLength = fetchedData.length;
	const gridSpace = gridSpaceSelect(width);

	return (
		<>
			<p className="mb-3 app__font-title">{capitalizer(title)}</p>
			<div className="text-dark data__window container">
				<div className="row">
					{fetchedData.length === 0 ? (
						<FetchLoader />
					) : (
						fetchedData.map((book, idx) => (
							<div
								className={`col-12 col-sm-6 ${gridSpace}`}
								style={colFlex}
								key={book.book_id + idx}
							>
								<div
									className="data__card bg-colour-light"
									style={marginFactory(arrLength, width, idx)}
								>
									{book.thumbnail && book.thumbnail !== '' ? (
										<img
											src={book.thumbnail}
											className="data__card-img-top"
											alt={book.title}
											style={imgBase}
										></img>
									) : (
										<div className="data__card-placeholder">
											<p>No</p>
											<p>Thumbnail</p>
											<p>Available</p>
										</div>
									)}
									<div className="data__card-body">
										<div className="data__card-info">
											<h5 className="data__card-title">{book.title}</h5>
											<p className="data__card-author">{book.author}</p>
										</div>
										<div className="data__card-btns">
											<button
												className="btn base-btn"
												data-button-type="wish"
												data-book-id={book.book_id}
												onClick={handleSelection}
											>
												+ Wish
											</button>
											<button
												className="btn base-btn"
												data-button-type="read"
												data-book-id={book.book_id}
												onClick={handleSelection}
											>
												+ Read
											</button>
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</>
	);
};

export default FetchedData;
