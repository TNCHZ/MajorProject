import axios from "axios";
import cookie from "react-cookies";

export const BASE_URL = 'http://localhost:8080/api/';


export const endpoints = {
	login: '/auth/login',
	profile: '/secure/profile',
	"add-reader": '/add/reader',
	books: '/books',
	'add-book': '/book/add',
	'categories': '/categories',
	'readers': '/readers',
	'borrow-slips': '/borrow-slips',
	'add-borrow-slip': '/add/borrow-slip',
	'find-reader-by-phone': '/reader/find-by-phone',
	'find-book-by-isbn': '/book/find-by-isbn',
	'payment-create': '/payment/create',
	'type-memberships': '/type-memberships',
	'membership-add': '/membership/add',
	'add-fine': '/add/fine',
	fines: '/fines',
	'update-borrow-slip': (id) => `/update/borrow-slip/${id}`,
	'books-by-borrow-slip': (id) => `/borrow-slip/${id}`,
	'update-fine': (id) => `/update/fine/${id}`,
	'book-count': '/book/count',
	'reader-count': '/reader/count',
	'borrow-slip-count': '/borrow-slip/count',
	'borrow-slip-count-monthly':'/borrow-slip/count/monthly',
	'fine-amount-monthly':'/fine/amount/monthly',
	'book-category-count': '/book/category/count',
	'book-borrow-slip-count':'/book/borrow-slip/count',
	'users': "/users",
	'payment-revenue': '/payment/revenue',
	'payments': '/payments'
}

export const authApis = () => {
	return axios.create({
		baseURL: BASE_URL,
		headers: {
			"Authorization": `Bearer ${cookie.load('token')}`,
		}
	})

}

export default axios.create({
	baseURL: BASE_URL
});
