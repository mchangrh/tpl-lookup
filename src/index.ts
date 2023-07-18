export interface Env {
}

import { bookStatus, status, branchStatus } from './types'

export const worker = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url)
		const search = url.searchParams.get('search')
		const type = url.searchParams.get('type')
		if (!search) return new Response('No search term', { status: 400 })
		const data = await getId(search)
			.then(id => getData(Number(id)))
		if (type === 'avail') {
			return new Response(await getAvailability(data), { status: 200 })
		} else if (type === 'loan') {
			return new Response(await findNextHold(data), { status: 200 })
		}
		return new Response(JSON.stringify(data), { status: 200 })
	},
};
export default worker

function getId (search: string) {
	const url = `https://www.torontopubliclibrary.ca/rss.jsp?Ntt=${search}`
	return fetch(url)
		.then(res => res.text())
		.then(data => data.match(/<recordId>(\d+)<\/recordId>/)?.[1])
}

const getData = async (id: number): Promise<bookStatus> =>
	fetch(`https://account.torontopubliclibrary.ca/item-availability/${id}`)
		.then(res => res.json())

async function getAvailability (data: bookStatus) {
	const availableBranches = data.branches
		.filter(branch => branch.items
			.some(item => item.status === status.inLibrary))
		.map(branch => branch.branchName)
	const branches = availableBranches.join(",")
	return branches
}

async function findNextHold (data: bookStatus) {
	const branchesWithLoans = data.branches
		.filter(branch => branch.items
			.some(item => item.status === status.loan))
	// map all holds to branches
	let soonestLoan = Infinity
	let soonestBranch = ''
	for (const branch of branchesWithLoans) {
		for (const book of branch.items) {
			const date = new Date(book.location.substring(5)).getTime()
			if (date < soonestLoan) {
				soonestLoan = date
				soonestBranch = branch.branchName
			}
		}
	}
	return JSON.stringify({ soonestLoan: new Date(soonestLoan).toISOString(), soonestBranch })
}