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
	'borrow-slips-reader': '/borrow-slips/reader',
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
	'borrow-slip-count-monthly': '/borrow-slip/count/monthly',
	'fine-amount-monthly': '/fine/amount/monthly',
	'book-category-count': '/book/category/count',
	'book-borrow-slip-count': '/book/borrow-slip/count',
	'users': "/users",
	'payment-revenue': '/payment/revenue',
	'payments': '/payments',
	'book': (id) => `/book/${id}`,
	'book-delete': (id) => `/book/delete/${id}`,
	'book-update': (id) => `/book/update/${id}`,
	'conservation-by-user': '/conservations/by-user',
	'borrow-slip-delete': (id) => `/borrow-slip/delete/${id}`,
	'conversation-user': (id) => `/conversation/user/${id}`,
	'fines-by-phone':  '/fines/by-phone',
	'fine-delete':  (id) => `/fine/delete/${id}`,
	'add-user': '/add/user',
	'user-update': (id) => `/user/update/${id}`,
	'user-delete': (id) => `/user/delete/${id}`,
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
