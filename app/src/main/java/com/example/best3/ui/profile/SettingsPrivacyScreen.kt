package com.example.best3.ui.profile

import android.widget.Toast
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
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
import com.example.best3.data.FirebaseManager
import com.example.best3.ui.theme.*
import kotlinx.coroutines.launch

@Preview(showBackground = true)
@Composable
fun SettingsPrivacyScreenPreview() {
    StyleAiTheme {
        SettingsPrivacyScreen(onBackClick = {}, onLogout = {})
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsPrivacyScreen(
    onBackClick: () -> Unit,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var showDeleteDialog by remember { mutableStateOf(false) }
    var isDeleting by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Settings & Privacy", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp) },
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
                .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.05f))))
                .verticalScroll(rememberScrollState())
                .padding(20.dp)
        ) {
            // ... (rest of categories)
            
            // Re-adding Categories because I need to keep the structure
            SettingsCategory("ACCOUNT SETTINGS") {
                SettingActionItem("Personal Information", Icons.Default.Person)
                SettingActionItem("Skin Preferences", Icons.Default.HealthAndSafety)
                SettingActionItem("Comfort Preferences", Icons.Default.Favorite)
                SettingActionItem("Fashion Preferences", Icons.Default.AutoAwesome)
            }

            SettingsCategory("APP SETTINGS") {
                SettingActionItem("Language", Icons.Default.Language, "English")
                SettingActionItem("Theme", Icons.Default.Palette, "System Default")
                SettingActionItem("Accessibility", Icons.Default.Accessibility)
            }

            SettingsCategory("SECURITY") {
                SettingToggleItem("Biometric Unlock", Icons.Default.Fingerprint, true)
                SettingActionItem("Change Password", Icons.Default.Lock)
                SettingActionItem("Two-Factor Authentication", Icons.Default.Security, "Off")
            }

            SettingsCategory("PRIVACY") {
                SettingActionItem("Data Sharing", Icons.Default.Share)
                SettingActionItem("Download My Data", Icons.Default.Download)
                SettingActionItem("AI Recommendation Permissions", Icons.Default.AutoAwesome)
            }

            SettingsCategory("SUPPORT") {
                SettingActionItem("Help Center", Icons.Default.HelpOutline)
                SettingActionItem("Contact Style AI", Icons.Default.SupportAgent)
                SettingActionItem("Legal & Policies", Icons.Default.Gavel)
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Danger Zone
            Button(
                onClick = { 
                    FirebaseManager.logout()
                    onLogout()
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFEBEE)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("Logout", color = Color.Red, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (isDeleting) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            } else {
                TextButton(
                    onClick = { showDeleteDialog = true },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Delete Account", color = Color.Gray, fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }

        if (showDeleteDialog) {
            AlertDialog(
                onDismissRequest = { showDeleteDialog = false },
                title = { Text("Delete Account?", fontWeight = FontWeight.Bold) },
                text = { Text("Deleting your account will permanently remove all profile data, recommendations, and order history. This action cannot be undone.") },
                confirmButton = {
                    TextButton(onClick = { 
                        showDeleteDialog = false
                        isDeleting = true
                        scope.launch {
                            val result = FirebaseManager.deleteUserAccount()
                            isDeleting = false
                            if (result.isSuccess) {
                                Toast.makeText(context, "Account Deleted Successfully", Toast.LENGTH_LONG).show()
                                onLogout() // Go back to login
                            } else {
                                Toast.makeText(context, "Error: ${result.exceptionOrNull()?.message}", Toast.LENGTH_LONG).show()
                            }
                        }
                    }) {
                        Text("Delete", color = Color.Red, fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showDeleteDialog = false }) {
                        Text("Cancel", color = Color.Black)
                    }
                },
                containerColor = White,
                shape = RoundedCornerShape(24.dp)
            )
        }
    }
}

@Composable
fun SettingsCategory(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(modifier = Modifier.padding(vertical = 12.dp)) {
        Text(
            text = title,
            modifier = Modifier.padding(start = 8.dp, bottom = 8.dp),
            style = MaterialTheme.typography.labelSmall.copy(color = Color.Gray, fontWeight = FontWeight.Black)
        )
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = White,
            border = BorderStroke(1.dp, LightBlue.copy(alpha = 0.3f)),
            shadowElevation = 1.dp
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                content()
            }
        }
    }
}

@Composable
fun SettingActionItem(title: String, icon: ImageVector, value: String? = null) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, tint = AccentBlue, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.width(16.dp))
        Text(title, modifier = Modifier.weight(1f), fontSize = 14.sp, fontWeight = FontWeight.Bold)
        if (value != null) {
            Text(value, color = Color.Gray, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 8.dp))
        }
        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = Color.LightGray, modifier = Modifier.size(20.dp))
    }
}

@Composable
fun SettingToggleItem(title: String, icon: ImageVector, checked: Boolean) {
    var isChecked by remember { mutableStateOf(checked) }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = AccentBlue, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
        Switch(
            checked = isChecked,
            onCheckedChange = { isChecked = it },
            colors = SwitchDefaults.colors(checkedTrackColor = AccentBlue)
        )
    }
}
