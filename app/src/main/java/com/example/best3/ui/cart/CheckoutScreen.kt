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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import com.example.best3.ui.theme.*

@Preview(showBackground = true)
@Composable
fun CheckoutScreenPreview() {
    StyleAiTheme {
        CheckoutScreen(onBackClick = {}, onOrderPlaced = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    productName: String = "Azure Linen Shirt",
    onBackClick: () -> Unit,
    onOrderPlaced: () -> Unit
) {
    var selectedPayment by remember { mutableStateOf("Credit Card") }
    var skinSafePackaging by remember { mutableStateOf(true) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Checkout", fontWeight = FontWeight.ExtraBold, color = Color.Black) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
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
            // Delivery Progress
            Row(
                modifier = Modifier.fillMaxWidth().padding(24.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                StepIndicator("1. Cart", true)
                HorizontalDivider(modifier = Modifier.weight(1f).padding(horizontal = 8.dp), color = AccentBlue)
                StepIndicator("2. Details", true)
                HorizontalDivider(modifier = Modifier.weight(1f).padding(horizontal = 8.dp), color = Color.LightGray)
                StepIndicator("3. Payment", false)
            }

            // Delivery Details
            SectionHeader("Delivery Details")
            Surface(
                modifier = Modifier.padding(horizontal = 16.dp),
                shape = RoundedCornerShape(20.dp),
                color = White,
                shadowElevation = 1.dp
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Person, null, tint = AccentBlue, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text("Balamurali Krishna", fontWeight = FontWeight.SemiBold)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Phone, null, tint = AccentBlue, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text("+91 98765 43210", color = Color.Gray)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LocationOn, null, tint = AccentBlue, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text("123 Style St, Fashion City, 50001", color = Color.Gray)
                    }
                }
            }

            // Payment Methods
            SectionHeader("Payment Method")
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                listOf("Credit Card", "UPI", "PayPal", "Wallet").forEach { method ->
                    PaymentOption(
                        method = method,
                        isSelected = selectedPayment == method,
                        onClick = { selectedPayment = method }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }

            // Skin Safe Packaging Option
            SectionHeader("Shipping Options")
            Surface(
                modifier = Modifier.padding(horizontal = 16.dp),
                shape = RoundedCornerShape(20.dp),
                color = White,
                shadowElevation = 1.dp
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                        Icon(Icons.Default.Inventory, null, tint = Color(0xFF4CAF50))
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Skin-Safe Packaging", fontWeight = FontWeight.SemiBold)
                            Text("Eco-friendly, chemical-free wrapping", fontSize = 12.sp, color = Color.Gray)
                        }
                    }
                    Switch(
                        checked = skinSafePackaging,
                        onCheckedChange = { skinSafePackaging = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = White, checkedTrackColor = AccentBlue)
                    )
                }
            }

            // Estimated Delivery
            Surface(
                modifier = Modifier.padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                color = LightBlue.copy(alpha = 0.2f)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.LocalShipping, null, tint = AccentBlue)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        "Estimated Delivery: 24 Oct - 26 Oct",
                        fontWeight = FontWeight.SemiBold,
                        color = AccentBlue
                    )
                }
            }

            // Final Checkout Button
            Button(
                onClick = onOrderPlaced,
                modifier = Modifier.fillMaxWidth().padding(16.dp).height(60.dp),
                shape = RoundedCornerShape(20.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
            ) {
                Text("Confirm Order • ₹10,999", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
            
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun StepIndicator(label: String, isDone: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Surface(
            modifier = Modifier.size(24.dp),
            shape = CircleShape,
            color = if (isDone) AccentBlue else Color.LightGray
        ) {
            if (isDone) Icon(Icons.Default.Check, null, tint = White, modifier = Modifier.padding(4.dp))
        }
        Text(label, fontSize = 10.sp, color = if (isDone) AccentBlue else Color.Gray)
    }
}

@Composable
fun SectionHeader(title: String) {
    Text(
        text = title,
        modifier = Modifier.padding(start = 24.dp, top = 24.dp, bottom = 12.dp),
        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black)
    )
}

@Composable
fun PaymentOption(method: String, isSelected: Boolean, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = White,
        border = if (isSelected) BorderStroke(2.dp, AccentBlue) else BorderStroke(1.dp, SoftGray),
        shadowElevation = if (isSelected) 4.dp else 0.dp
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    when(method) {
                        "Credit Card" -> Icons.Default.CreditCard
                        "UPI" -> Icons.Default.AccountBalanceWallet
                        "PayPal" -> Icons.Default.Payment
                        else -> Icons.Default.Wallet
                    },
                    null,
                    tint = if (isSelected) AccentBlue else Color.Gray
                )
                Spacer(modifier = Modifier.width(16.dp))
                Text(method, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium)
            }
            RadioButton(
                selected = isSelected,
                onClick = onClick,
                colors = RadioButtonDefaults.colors(selectedColor = AccentBlue)
            )
        }
    }
}
