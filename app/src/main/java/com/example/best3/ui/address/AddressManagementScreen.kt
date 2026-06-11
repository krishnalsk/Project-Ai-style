package com.example.best3.ui.address

import android.widget.Toast
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
fun AddressManagementScreenPreview() {
    StyleAiTheme {
        AddressManagementScreen(onBackClick = {})
    }
}

data class UserAddress(
    val id: String,
    val type: String, // Home, Office, Other
    val fullAddress: String,
    val contact: String,
    val isDefault: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressManagementScreen(onBackClick: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(false) }

    val savedAddresses = listOf(
        UserAddress("1", "Home", "Flat 402, Sunshine Apartments, Jubilee Hills, Hyderabad, Telangana - 500033", "+91 98765 43210", true),
        UserAddress("2", "Office", "Cyber Towers, Hitech City, Hyderabad, Telangana - 500081", "+91 98765 12345")
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Delivery Address", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                actions = {
                    IconButton(onClick = { /* Add New */ }) {
                        Icon(Icons.Default.AddLocationAlt, null, tint = AccentBlue)
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
                // Section: Saved Addresses
                Text("Your Saved Addresses", fontWeight = FontWeight.ExtraBold, color = Color.Gray, fontSize = 14.sp)
                Spacer(modifier = Modifier.height(16.dp))
                
                savedAddresses.forEach { address ->
                    AddressCard(address)
                    Spacer(modifier = Modifier.height(16.dp))
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Section: Add New Form
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = White),
                    border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.3f))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("Add New Address", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Current Location Button
                        OutlinedButton(
                            onClick = { /* Auto fill logic */ },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.dp, AccentBlue)
                        ) {
                            Icon(Icons.Default.MyLocation, null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Use Current Location", fontSize = 14.sp)
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        AddressInputField("Full Name", Icons.Default.Person)
                        AddressInputField("Mobile Number", Icons.Default.Phone)
                        AddressInputField("House / Flat / Area", Icons.Default.Home)
                        AddressInputField("Street / Landmark", Icons.Default.Map)
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            AddressInputField("City", Icons.Default.LocationCity, Modifier.weight(1f))
                            AddressInputField("Pincode", Icons.Default.PinDrop, Modifier.weight(1f))
                        }
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Address Type", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AccentBlue)
                        Row(modifier = Modifier.padding(top = 8.dp)) {
                            listOf("Home", "Office", "Other").forEach { type ->
                                FilterChip(
                                    selected = type == "Home",
                                    onClick = { },
                                    label = { Text(type) },
                                    modifier = Modifier.padding(end = 8.dp)
                                )
                            }
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
                            Toast.makeText(context, "Address Saved Successfully!", Toast.LENGTH_SHORT).show()
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                ) {
                    Text("Save Address", fontWeight = FontWeight.Bold)
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
fun AddressCard(address: UserAddress) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = when(address.type) {
                        "Home" -> Icons.Default.Home
                        "Office" -> Icons.Default.Business
                        else -> Icons.Default.LocationOn
                    },
                    contentDescription = null,
                    tint = AccentBlue,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(address.type, fontWeight = FontWeight.Black, fontSize = 16.sp)
                Spacer(modifier = Modifier.width(8.dp))
                if (address.isDefault) {
                    Surface(color = Color(0xFFE8F5E9), shape = RoundedCornerShape(4.dp)) {
                        Text("DEFAULT", modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp), color = Color(0xFF2E7D32), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Spacer(modifier = Modifier.weight(1f))
                IconButton(onClick = {}) { Icon(Icons.Default.Edit, null, tint = Color.LightGray, modifier = Modifier.size(20.dp)) }
                IconButton(onClick = {}) { Icon(Icons.Default.Delete, null, tint = Color(0xFFFFCDD2), modifier = Modifier.size(20.dp)) }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            Text(address.fullAddress, color = Color.DarkGray, fontSize = 14.sp, lineHeight = 20.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Contact: ${address.contact}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = Color.Gray)
        }
    }
}

@Composable
fun AddressInputField(label: String, icon: ImageVector, modifier: Modifier = Modifier) {
    OutlinedTextField(
        value = "", onValueChange = {},
        label = { Text(label) },
        leadingIcon = { Icon(icon, null, tint = AccentBlue, modifier = Modifier.size(20.dp)) },
        modifier = modifier.fillMaxWidth().padding(vertical = 6.dp),
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentBlue)
    )
}
