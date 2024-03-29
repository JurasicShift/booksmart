
import { useSelector, useDispatch } from 'react-redux';
import { sortBooks } from '../redux/slices/wishSlice';
import { sortReadBooks } from '../redux/slices/readSlice';


const Sort = ({wish, read}) => {
	const sortTitles = ['Author', 'Year', 'Rating'];
	const tab = useSelector(state => state.tabs.active);
	const dispatch = useDispatch();


	const handleSort = e => {
		const sortTarget = e.target.name;
		const sortList = tab === 1 ? wish : read;
		const listSorted = [...sortList];
		switch (sortTarget) {
			case 'Author':
				listSorted.sort((a, b) =>
					a.authorparse === b.authorparse
						? 0
						: a.authorparse < b.authorparse
						? -1
						: 1
				);
				break;
			case 'Year':
				listSorted.sort((a, b) => b.publisheddate - a.publisheddate);
				break;
			case 'Rating':
				listSorted.sort((a, b) => b.rating - a.rating);
				break;
				default:
					listSorted.sort();
		}

		dispatch(tab === 1 ? sortBooks(listSorted) : sortReadBooks(listSorted));

	};

	

	return (
		<search className=" mt-4 sort" >
			<div className="dropdown">
				<button
					className="btn btn-secondary btn-sm dropdown-toggle"
					type="button"
					data-bs-toggle="dropdown"
					aria-expanded="false"
					data-bs-display="static"
				>
					Sort by
				</button>
			
				<ul className="dropdown-menu sort__custom dropdown-menu-end " >
					<div className="d-flex" >
						{sortTitles.map((title, idx) => {
							return (
								<li key={title + idx} className="px-1">
									<button
										type="radio"
										className={`btn`}
										name={title}
										id={title + idx}
										autoComplete="off"
										onClick={e => handleSort(e)}
									></button>
									<label
										className={`btn btn-sm sort__labels`}
										htmlFor={title + idx}
									>
										{title}
									</label>
								</li>
							);
						})}
					</div>
				</ul>
			</div>
		</search>
	);
};

export default Sort;
