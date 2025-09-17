import 'package:flutter/material.dart';
import 'package:mobile_app/api/api_client.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';

class CartPage extends StatelessWidget {
  const CartPage({super.key});

  Future<void> _reserveBooks(BuildContext context, CartProvider cartProvider) async {
    try {
      // Body chỉ gồm bookId
      final body = {
        "books": cartProvider.items.map((item) {
          return {
            "bookId": item.bookId,
          };
        }).toList(),
      };

      final response = await AuthApiClient.post(Endpoints.reserveBook, body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Đặt sách thành công ✅")),
        );
        cartProvider.clearCart();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Đặt sách thất bại ❌ (${response.statusCode})")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Lỗi khi đặt sách: $e")),
      );
    }
  }


  @override
  Widget build(BuildContext context) {
    final cartProvider = Provider.of<CartProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Cart'),
        backgroundColor: Colors.blueAccent,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: cartProvider.items.isEmpty
          ? const Center(
        child: Text(
          'Your cart is empty 📭',
          style: TextStyle(fontSize: 18, color: Colors.black54),
        ),
      )
          : ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: cartProvider.items.length,
        itemBuilder: (context, index) {
          final item = cartProvider.items[index];
          return Card(
            margin: const EdgeInsets.symmetric(vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: item.image.isNotEmpty
                        ? Image.network(
                      item.image,
                      width: 80,
                      height: 120,
                      fit: BoxFit.cover,
                    )
                        : Container(
                      width: 80,
                      height: 120,
                      color: Colors.grey[400],
                      child: const Center(
                        child: Text(
                          'No image',
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment:
                          MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "Số lượng: ${item.quantity}",
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete,
                                  color: Colors.red),
                              onPressed: () {
                                cartProvider.removeFromCart(item.bookId);
                                ScaffoldMessenger.of(context)
                                    .showSnackBar(
                                  SnackBar(
                                    content: Text(
                                        '${item.title} removed from cart'),
                                    duration:
                                    const Duration(seconds: 2),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
      bottomNavigationBar: cartProvider.items.isNotEmpty
          ? Padding(
        padding: const EdgeInsets.all(12.0),
        child: ElevatedButton(
          onPressed: () => _reserveBooks(context, cartProvider),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
          ),
          child: const Text(
            'Đặt sách',
            style: TextStyle(fontSize: 16),
          ),
        ),
      )
          : null,
    );
  }
}
