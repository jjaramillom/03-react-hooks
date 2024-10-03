import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
	type BlogPost,
	generateGradient,
	getMatchingPosts,
} from '#shared/blog-posts'
import { setGlobalSearchParams } from '#shared/utils'

function getQueryParam() {
	const params = new URLSearchParams(window.location.search)
	return params.get('query') ?? ''
}

function App() {
	const [query, setQuery] = useState(getQueryParam)

	useEffect(() => {
		const updateQuery = () => setQuery(getQueryParam())
		window.addEventListener('popstate', updateQuery)
		return () => {
			window.removeEventListener('popstate', updateQuery)
		}
	}, [])

	return (
		<div className="app">
			<Form query={query} setQuery={setQuery} />
			<MatchingPosts query={query} />
		</div>
	)
}

function Form({
	query,
	setQuery,
}: {
	query: string
	setQuery: (query: string) => void
}) {
	const words = query.split(' ').map(w => w.trim())

	const dogChecked = words.includes('dog')
	const catChecked = words.includes('cat')
	const caterpillarChecked = words.includes('caterpillar')

	function handleCheck(tag: string, checked: boolean) {
		const newWords = checked ? [...words, tag] : words.filter(w => w !== tag)
		setQuery(newWords.filter(Boolean).join(' ').trim())
	}

	return (
		<form action={() => setGlobalSearchParams({ query })}>
			<div>
				<label htmlFor="searchInput">Search:</label>
				<input
					id="searchInput"
					name="query"
					type="search"
					value={query}
					onChange={e => setQuery(e.currentTarget.value)}
				/>
			</div>
			<div>
				<label>
					<input
						type="checkbox"
						checked={dogChecked}
						onChange={e => handleCheck('dog', e.currentTarget.checked)}
					/>{' '}
					🐶 dog
				</label>
				<label>
					<input
						type="checkbox"
						checked={catChecked}
						onChange={e => handleCheck('cat', e.currentTarget.checked)}
					/>{' '}
					🐱 cat
				</label>
				<label>
					<input
						type="checkbox"
						checked={caterpillarChecked}
						onChange={e => handleCheck('caterpillar', e.currentTarget.checked)}
					/>{' '}
					🐛 caterpillar
				</label>
			</div>
			<button type="submit">Submit</button>
		</form>
	)
}

function MatchingPosts({ query }: { query: string }) {
	const matchingPosts = getMatchingPosts(query)
	const [favoriteCards, setFavoriteCards] = useState<string[]>([])
	console.log(favoriteCards)

	return (
		<ul className="post-list">
			{matchingPosts
				.sort((a, b) => {
					// 🐨 determine whether post a and b are included in favorites
					const aFav = favoriteCards.includes(a.id) // 💰 favorites.includes(a.id)
					const bFav = favoriteCards.includes(b.id) // 💰 favorites.includes(b.id)
					return aFav === bFav ? 0 : aFav ? -1 : 1
				})
				.map(post => (
					<Card
						key={post.id}
						post={post}
						isFavorited={favoriteCards.includes(post.id)}
						onFavoriteClick={isFav => {
							if (isFav) {
								setFavoriteCards(currState => [...currState, post.id])
							} else {
								setFavoriteCards(currState =>
									currState.filter(id => id !== post.id),
								)
							}
						}}
						// 🐨 pass an isFavorited prop
						// 🐨 pass an onFavoriteClick that accepts a "favorite" boolean
						//   if it's true, then add the post.id to the favorites
						//   if it's false, then remove the post.id from the favorites
					/>
				))}
		</ul>
	)
}

// 🐨 add props for isFavorited and onFavoriteClick
function Card({
	post,
	isFavorited,
	onFavoriteClick,
}: {
	post: BlogPost
	isFavorited: boolean
	onFavoriteClick: (val: boolean) => void
}) {
	// 🐨 lift this up to MatchingPosts
	return (
		<li>
			{isFavorited ? (
				<button
					aria-label="Remove favorite"
					// 🐨 call onFavoriteClick
					onClick={() => onFavoriteClick(false)}
				>
					❤️
				</button>
			) : (
				// 🐨 call onFavoriteClick
				<button
					aria-label="Add favorite"
					onClick={() => onFavoriteClick(true)}
				>
					🤍
				</button>
			)}
			<div
				className="post-image"
				style={{ background: generateGradient(post.id) }}
			/>
			<a
				href={post.id}
				onClick={event => {
					event.preventDefault()
					alert(`Great! Let's go to ${post.id}!`)
				}}
			>
				<h2>{post.title}</h2>
				<p>{post.description}</p>
			</a>
		</li>
	)
}

const rootEl = document.createElement('div')
document.body.append(rootEl)
createRoot(rootEl).render(<App />)
