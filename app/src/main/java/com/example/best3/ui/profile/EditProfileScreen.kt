package com.example.best3.ui.profile

import android.widget.Toast
import androidx.compose.animation.*
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview
import coil.compose.AsyncImage
import com.example.best3.data.FirebaseManager
import com.example.best3.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Preview(showBackground = true)
@Composable
fun EditProfileScreenPreview() {
    StyleAiTheme {
        EditProfileScreen(onBackClick = {}, onSaveClick = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(onBackClick: () -> Unit, onSaveClick: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var mobile by remember { mutableStateOf("") }
    var dob by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        isLoading = true
        val result = FirebaseManager.getUserProfile()
        result.getOrNull()?.let {
            name = it.fullName ?: ""
            email = it.email ?: ""
            location = it.location ?: ""
        }
        isLoading = false
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Edit Personal Information", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, null)
                    }
                },
                actions = {
                    TextButton(onClick = {
                        if (name.isBlank()) {
                            Toast.makeText(context, "Name cannot be empty", Toast.LENGTH_SHORT).show()
                        } else {
                            scope.launch {
                                isLoading = true
                                val currentProfile = FirebaseManager.getUserProfile().getOrNull() ?: com.example.best3.data.UserProfile()
                                val updatedProfile = currentProfile.copy(
                                    fullName = name,
                                    email = email,
                                    location = location
                                )
                                val result = FirebaseManager.saveUserProfile(updatedProfile)
                                isLoading = false
                                if (result.isSuccess) {
                                    Toast.makeText(context, "Profile Updated Successfully!", Toast.LENGTH_SHORT).show()
                                    onSaveClick()
                                } else {
                                    Toast.makeText(context, "Failed to update profile", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                    }) {
                        Text("Save", color = AccentBlue, fontWeight = FontWeight.Bold)
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
                // Premium Profile Photo Section
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(32.dp),
                    colors = CardDefaults.cardColors(containerColor = White.copy(alpha = 0.7f)),
                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.5f))
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box {
                            AsyncImage(
                                model = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
                                contentDescription = "Profile Photo",
                                modifier = Modifier
                                    .size(120.dp)
                                    .clip(CircleShape)
                                    .border(4.dp, White, CircleShape),
                                contentScale = ContentScale.Crop,
                                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                            )
                            Surface(
                                modifier = Modifier
                                    .align(Alignment.BottomEnd)
                                    .size(36.dp)
                                    .offset(x = (-4).dp, y = (-4).dp),
                                shape = CircleShape,
                                color = AccentBlue,
                                shadowElevation = 4.dp
                            ) {
                                Icon(
                                    Icons.Default.Edit, 
                                    null, 
                                    tint = White, 
                                    modifier = Modifier.padding(8.dp)
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            OutlinedButton(
                                onClick = { /* Upload */ },
                                shape = RoundedCornerShape(12.dp),
                                border = BorderStroke(1.dp, AccentBlue)
                            ) {
                                Text("Upload New", fontSize = 12.sp)
                            }
                            TextButton(onClick = { /* Remove */ }) {
                                Text("Remove", color = Color.Red, fontSize = 12.sp)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Editable Fields - Premium Glassmorphism Cards
                Text("Personal Details", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = Color.Gray)
                Spacer(modifier = Modifier.height(12.dp))

                PremiumEditCard {
                    Column(modifier = Modifier.padding(16.dp)) {
                        PremiumEditField("Full Name", name, Icons.Default.Person) { name = it }
                        Spacer(modifier = Modifier.height(16.dp))
                        PremiumEditField("Email Address", email, Icons.Default.Email) { email = it }
                        Spacer(modifier = Modifier.height(16.dp))
                        PremiumEditField("Location", location, Icons.Default.LocationOn) { location = it }
                        Spacer(modifier = Modifier.height(16.dp))
                        PremiumEditField("Mobile Number", mobile, Icons.Default.Phone) { mobile = it }
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            PremiumEditField("Date of Birth", dob, Icons.Default.Cake, modifier = Modifier.weight(1.2f)) { dob = it }
                            PremiumEditField("Gender", gender, Icons.Default.Transgender, modifier = Modifier.weight(0.8f)) { gender = it }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))
                
                TextButton(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            val result = FirebaseManager.getUserProfile()
                            result.getOrNull()?.let {
                                name = it.fullName ?: ""
                                email = it.email ?: ""
                                location = it.location ?: ""
                            }
                            isLoading = false
                        }
                    },
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                ) {
                    Icon(Icons.Default.Refresh, null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Reset Changes", fontWeight = FontWeight.SemiBold)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            val currentProfile = FirebaseManager.getUserProfile().getOrNull() ?: com.example.best3.data.UserProfile()
                            val updatedProfile = currentProfile.copy(
                                fullName = name,
                                email = email,
                                location = location
                            )
                            val result = FirebaseManager.saveUserProfile(updatedProfile)
                            isLoading = false
                            if (result.isSuccess) {
                                Toast.makeText(context, "All Changes Saved!", Toast.LENGTH_SHORT).show()
                                onSaveClick()
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(60.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                ) {
                    Text("Save Profile", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                }
                
                Spacer(modifier = Modifier.height(40.dp))
            }

            if (isLoading) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.Black.copy(alpha = 0.3f)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Card(
                            shape = RoundedCornerShape(24.dp),
                            colors = CardDefaults.cardColors(containerColor = White)
                        ) {
                            Row(
                                modifier = Modifier.padding(24.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                CircularProgressIndicator(color = AccentBlue, modifier = Modifier.size(24.dp))
                                Spacer(modifier = Modifier.width(16.dp))
                                Text("Updating Profile...", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PremiumEditCard(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.2f))
    ) {
        content()
    }
}

@Composable
fun PremiumEditField(label: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier = Modifier, onValueChange: (String) -> Unit) {
    Column(modifier = modifier) {
        Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AccentBlue, modifier = Modifier.padding(start = 4.dp, bottom = 4.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            leadingIcon = { Icon(icon, null, tint = AccentBlue, modifier = Modifier.size(20.dp)) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Color.Transparent,
                focusedBorderColor = AccentBlue,
                unfocusedContainerColor = SoftGray.copy(alpha = 0.4f),
                focusedContainerColor = SoftGray.copy(alpha = 0.1f)
            ),
            singleLine = true
        )
    }
}
