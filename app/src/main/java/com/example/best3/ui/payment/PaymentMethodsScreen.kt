package com.example.best3.ui.payment

import android.widget.Toast
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.best3.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Preview(showBackground = true)
@Composable
fun PaymentMethodsScreenPreview() {
    StyleAiTheme {
        PaymentMethodsScreen(onBackClick = {})
    }
}

data class PaymentCard(
    val id: String,
    val type: String,
    val lastFour: String,
    val expiry: String,
    val isDefault: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentMethodsScreen(onBackClick: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(false) }
    
    val savedCards = listOf(
        PaymentCard("1", "Visa", "4589", "12/26", true),
        PaymentCard("2", "Mastercard", "7721", "09/25")
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Payment Methods", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                actions = {
                    IconButton(onClick = { /* Add logic */ }) {
                        Icon(Icons.Default.AddCircle, null, tint = AccentBlue)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = White)
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.1f))))
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp)
            ) {
                // Section: Saved Cards
                Text("Saved Cards", fontWeight = FontWeight.ExtraBold, color = Color.Gray, fontSize = 14.sp)
                Spacer(modifier = Modifier.height(16.dp))
                
                savedCards.forEach { card ->
                    PremiumPaymentCard(card)
                    Spacer(modifier = Modifier.height(16.dp))
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Section: Other Methods
                Text("Other Payment Methods", fontWeight = FontWeight.ExtraBold, color = Color.Gray, fontSize = 14.sp)
                Spacer(modifier = Modifier.height(12.dp))
                
                PaymentOptionItem("Unified Payments Interface (UPI)", Icons.Default.AccountBalanceWallet)
                PaymentOptionItem("Net Banking", Icons.Default.AccountBalance)
                PaymentOptionItem("Cash on Delivery", Icons.Default.Payments)

                Spacer(modifier = Modifier.height(32.dp))

                // Section: Add New
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = White),
                    border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.3f))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("Add New Card", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        OutlinedTextField(
                            value = "", onValueChange = {}, 
                            label = { Text("Card Holder Name") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = "", onValueChange = {}, 
                            label = { Text("Card Number") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            leadingIcon = { Icon(Icons.Default.CreditCard, null, tint = AccentBlue) }
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            OutlinedTextField(value = "", onValueChange = {}, label = { Text("Expiry (MM/YY)") }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp))
                            OutlinedTextField(value = "", onValueChange = {}, label = { Text("CVV") }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            delay(1500)
                            isLoading = false
                            Toast.makeText(context, "Payment Method Added!", Toast.LENGTH_SHORT).show()
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                ) {
                    Text("Save Payment Method", fontWeight = FontWeight.Bold)
                }
                
                Spacer(modifier = Modifier.height(40.dp))
            }
            
            if (isLoading) {
                Surface(modifier = Modifier.fillMaxSize(), color = Color.Black.copy(alpha = 0.4f)) {
                    Box(contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = White)
                    }
                }
            }
        }
    }
}

@Composable
fun PremiumPaymentCard(card: PaymentCard) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier.size(48.dp).background(LightBlue.copy(alpha = 0.3f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (card.type == "Visa") Icons.Default.CreditCard else Icons.Default.CreditCardOff,
                    contentDescription = null,
                    tint = AccentBlue
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text("${card.type} •••• ${card.lastFour}", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                Text("Expires ${card.expiry}", color = Color.Gray, fontSize = 12.sp)
            }
            if (card.isDefault) {
                Surface(color = Color(0xFFE8F5E9), shape = RoundedCornerShape(8.dp)) {
                    Text("DEFAULT", modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp), color = Color(0xFF2E7D32), fontSize = 10.sp, fontWeight = FontWeight.Black)
                }
            }
            IconButton(onClick = {}) {
                Icon(Icons.Default.MoreVert, null, tint = Color.LightGray)
            }
        }
    }
}

@Composable
fun PaymentOptionItem(title: String, icon: ImageVector) {
    Surface(
        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        color = White.copy(alpha = 0.6f),
        border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.3f)),
        onClick = {}
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = AccentBlue, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Text(title, modifier = Modifier.weight(1f), fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            Icon(Icons.Default.ChevronRight, null, tint = Color.LightGray)
        }
    }
}
