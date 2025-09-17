import 'package:flutter/material.dart';
import '../models/cart_item.dart';

class CartProvider with ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items => _items;

  void addToCart(CartItem item) {
    final index = _items.indexWhere((e) => e.bookId == item.bookId);
    if (index >= 0) {
      _items[index].quantity++;
    } else {
      _items.add(item);
    }
    notifyListeners();
  }

  void removeFromCart(int bookId) {
    _items.removeWhere((e) => e.bookId == bookId);
    notifyListeners();
  }

  void increaseQuantity(int bookId) {
    final index = _items.indexWhere((e) => e.bookId == bookId);
    if (index >= 0) {
      _items[index].quantity++;
      notifyListeners();
    }
  }

  void decreaseQuantity(int bookId) {
    final index = _items.indexWhere((e) => e.bookId == bookId);
    if (index >= 0 && _items[index].quantity > 1) {
      _items[index].quantity--;
      notifyListeners();
    }
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }

  int get totalItems => _items.fold(0, (sum, item) => sum + item.quantity);
}