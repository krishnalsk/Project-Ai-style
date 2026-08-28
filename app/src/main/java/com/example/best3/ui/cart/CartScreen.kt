package com.example.best3.ui.cart

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun CartScreenPreview() {
    StyleAiTheme {
        CartScreen(onBackClick = {}, onCheckoutClick = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    onBackClick: () -> Unit,
    onCheckoutClick: () -> Unit
) {
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("My Cart", fontWeight = FontWeight.ExtraBold, color = Color.Black) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Go back")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.1f))))
                .verticalScroll(rememberScrollState())
        ) {
            // Delivery Address Section
            Surface(
                modifier = Modifier.padding(16.dp),
                shape = RoundedCornerShape(24.dp),
                color = White,
                shadowElevation = 2.dp
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.LocationOn, "Delivery address", tint = AccentBlue)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Delivery Address", color = Color.Gray, fontSize = 12.sp)
                        Text("123 Style St, Fashion City, 50001", fontWeight = FontWeight.SemiBold)
                    }
                    TextButton(onClick = {}) {
                        Text("Change", color = AccentBlue)
                    }
                }
            }

            // AI Compatibility Warning
            Surface(
                modifier = Modifier.padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                color = AccentBlue.copy(alpha = 0.1f)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.AutoAwesome, "AI compatibility", tint = AccentBlue, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        "AI: All fabrics in your cart are safe for your skin profile.",
                        fontSize = 13.sp,
                        color = AccentBlue,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Cart Items
            val cartItems = listOf(
                Triple("Azure Linen Shirt", "₹4,399", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"),
                Triple("Organic Cotton Hoodie", "₹5,799", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400")
            )

            if (cartItems.isEmpty()) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = null,
                        tint = Color.LightGray,
                        modifier = Modifier.size(80.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Your cart is empty",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = Color.Gray)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Add items to get started",
                        style = MaterialTheme.typography.bodyMedium.copy(color = Color.LightGray)
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = onBackClick,
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                    ) {
                        Icon(Icons.Default.ShoppingBag, "Start shopping", tint = White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Start Shopping", fontWeight = FontWeight.Bold)
                    }
                }
            } else {
                Column(modifier = Modifier.padding(16.dp)) {
                    CartItemCard(
                        name = "Azure Linen Shirt",
                        fabric = "Breathable Linen",
                        price = "₹4,399",
                        score = "95",
                        image = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    CartItemCard(
                        name = "Organic Cotton Hoodie",
                        fabric = "GOTS Certified Cotton",
                        price = "₹5,799",
                        score = "98",
                        image = "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"
                    )
                }
            }

            // Coupon Section
            OutlinedTextField(
                value = "",
                onValueChange = {},
                placeholder = { Text("Enter Coupon Code") },
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                trailingIcon = {
                    TextButton(onClick = {}) {
                        Text("Apply", color = AccentBlue, fontWeight = FontWeight.Bold)
                    }
                }
            )

            // Price Summary
            Surface(
                modifier = Modifier.padding(16.dp),
                shape = RoundedCornerShape(24.dp),
                color = White,
                shadowElevation = 4.dp
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("Order Summary", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = Color.Black)
                    Spacer(modifier = Modifier.height(16.dp))
                    SummaryRow("Subtotal", "₹10,198")
                    SummaryRow("Shipping", "Free")
                    SummaryRow("Tax", "₹849")
                    Divider(modifier = Modifier.padding(vertical = 12.dp), color = SoftGray)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Total Amount", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("₹11,047", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = AccentBlue)
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Button(
                        onClick = onCheckoutClick,
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                    ) {
                        Text("Proceed to Checkout", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun CartItemCard(name: String, fabric: String, price: String, score: String, image: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = White)
    ) {
        Row(modifier = Modifier.padding(12.dp)) {
            AsyncImage(
                model = image,
                contentDescription = null,
                modifier = Modifier.size(90.dp).clip(RoundedCornerShape(12.dp)),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(name, fontWeight = FontWeight.ExtraBold, color = Color.Black)
                    Icon(Icons.Default.Delete, "Remove $name", tint = Color.LightGray, modifier = Modifier.size(20.dp))
                }
                Text(fabric, color = Color.Gray, fontSize = 12.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Surface(color = LightBlue.copy(alpha = 0.3f), shape = CircleShape) {
                    Text(
                        text = "$score% Comfort",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                        color = AccentBlue,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(price, fontWeight = FontWeight.Bold, color = AccentBlue)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(onClick = {}, shape = CircleShape, color = SoftGray) {
                            Icon(Icons.Default.Remove, "Decrease quantity", modifier = Modifier.size(16.dp).padding(4.dp))
                        }
                        Text("1", modifier = Modifier.padding(horizontal = 12.dp), fontWeight = FontWeight.Bold)
                        Surface(onClick = {}, shape = CircleShape, color = AccentBlue) {
                            Icon(Icons.Default.Add, "Increase quantity", tint = White, modifier = Modifier.size(16.dp).padding(4.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SummaryRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Color.Gray)
        Text(value, fontWeight = FontWeight.SemiBold)
    }
}
