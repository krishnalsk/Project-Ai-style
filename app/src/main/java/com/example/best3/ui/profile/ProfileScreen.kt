package com.example.best3.ui.profile

import android.util.Log
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.result.launch
import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.compose.rememberAsyncImagePainter
import com.example.best3.data.FirebaseManager
import com.example.best3.data.UserProfile
import com.example.best3.ui.theme.*
import com.example.best3.R
import kotlinx.coroutines.launch

@Preview(showBackground = true)
@Composable
fun ProfileScreenPreview() {
    StyleAiTheme {
        ProfileScreen(
            onBackClick = {},
            onAiStylistClick = {},
            onLogout = {},
            onSettingsClick = {},
            onOrdersClick = {},
            onSizeRecommendationClick = {},
            onEditProfileClick = {},
            onSkinPreferencesClick = {},
            onPaymentMethodsClick = {},
            onDeliveryAddressClick = {},
            onSettingsPrivacyClick = {},
            onHomeClick = {},
            onSearchClick = {},
            onWishlistClick = {},
            onSkinComfortDiaryClick = {},
            onVirtualClosetClick = {},
            onSavedItemsClick = {},
            onRewardsClick = {}
        )
    }
}

@Composable
fun ProfileScreen(
    onBackClick: () -> Unit,
    onAiStylistClick: () -> Unit,
    onLogout: () -> Unit,
    onSettingsClick: () -> Unit,
    onOrdersClick: () -> Unit,
    onSizeRecommendationClick: () -> Unit,
    onSkinPreferencesClick: () -> Unit,
    onEditProfileClick: () -> Unit,
    onPaymentMethodsClick: () -> Unit,
    onDeliveryAddressClick: () -> Unit,
    onSettingsPrivacyClick: () -> Unit,
    onHomeClick: () -> Unit,
    onSearchClick: () -> Unit,
    onWishlistClick: () -> Unit,
    onSkinComfortDiaryClick: () -> Unit,
    onVirtualClosetClick: () -> Unit,
    onSavedItemsClick: () -> Unit,
    onRewardsClick: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var userProfile by remember { mutableStateOf<UserProfile?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var profileImage by remember { mutableStateOf<Any?>(null) }

    val cameraLauncher = rememberLauncherForActivityResult(ActivityResultContracts.TakePicturePreview()) { bitmap ->
        Log.d("ProfileScreen", "Camera result received: ${bitmap != null}")
        if (bitmap != null) {
            profileImage = bitmap
            Toast.makeText(context, "Photo captured!", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(context, "Camera cancelled", Toast.LENGTH_SHORT).show()
        }
    }

    val galleryLauncher = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        Log.d("ProfileScreen", "Gallery result received: $uri")
        if (uri != null) {
            profileImage = uri
            Toast.makeText(context, "Photo selected from gallery!", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(context, "Gallery selection cancelled", Toast.LENGTH_SHORT).show()
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        Log.d("ProfileScreen", "Permission result: $isGranted")
        if (isGranted) {
            cameraLauncher.launch()
        } else {
            Toast.makeText(context, "Camera permission denied", Toast.LENGTH_SHORT).show()
        }
    }

    var showImageSourceDialog by remember { mutableStateOf(false) }

    if (showImageSourceDialog) {
        AlertDialog(
            onDismissRequest = { showImageSourceDialog = false },
            title = { Text(stringResource(R.string.change_profile_picture), fontWeight = FontWeight.Bold) },
            text = { Text(stringResource(R.string.change_profile_picture_desc)) },
            confirmButton = {
                Button(
                    onClick = { 
                        Log.d("ProfileScreen", "Launching camera permission request")
                        permissionLauncher.launch(android.Manifest.permission.CAMERA)
                        showImageSourceDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                ) {
                    Icon(Icons.Default.CameraAlt, null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.camera))
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { 
                        Log.d("ProfileScreen", "Launching gallery picker")
                        galleryLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                        showImageSourceDialog = false
                    },
                    border = BorderStroke(1.dp, AccentBlue)
                ) {
                    Icon(Icons.Default.Image, null, tint = AccentBlue, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.gallery), color = AccentBlue)
                }
            }
        )
    }

    LaunchedEffect(Unit) {
        val result = FirebaseManager.getUserProfile()
        userProfile = result.getOrNull()
        isLoading = false
    }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = White,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(icon = { Icon(Icons.Outlined.Home, null) }, label = { Text("Home") }, selected = false, onClick = onHomeClick)
                NavigationBarItem(icon = { Icon(Icons.Outlined.Search, null) }, label = { Text("Search") }, selected = false, onClick = onSearchClick)
                NavigationBarItem(icon = { Icon(Icons.Outlined.FavoriteBorder, null) }, label = { Text("Wishlist") }, selected = false, onClick = onWishlistClick)
                NavigationBarItem(icon = { Icon(Icons.Filled.Person, null) }, label = { Text("Profile") }, selected = true, onClick = {})
            }
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onAiStylistClick,
                containerColor = AccentBlue,
                contentColor = White,
                icon = { Icon(Icons.Default.AutoAwesome, null) },
                text = { Text("AI Stylist") },
                shape = RoundedCornerShape(16.dp)
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AccentBlue)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(Brush.verticalGradient(listOf(White, LightBlue.copy(alpha = 0.5f))))
                    .verticalScroll(rememberScrollState())
            ) {
                // Header Section
                ProfileHeader(
                    onBackClick = onBackClick, 
                    name = userProfile?.fullName ?: "User",
                    profileImage = profileImage,
                    onImageClick = { showImageSourceDialog = true }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Profile Info Card
                ProfileInfoCard(onEditProfileClick, userProfile)

                Spacer(modifier = Modifier.height(24.dp))

                // AI Recommendation Card
                AiComfortCard(userProfile?.comfortScore ?: 92)

                Spacer(modifier = Modifier.height(24.dp))

                // Activity Dashboard
                ActivityDashboard(onOrdersClick, onWishlistClick, onSavedItemsClick, onRewardsClick)

                Spacer(modifier = Modifier.height(24.dp))

                // Settings/Options List
                SettingsSection(
                    onLogout = {
                        FirebaseManager.logout()
                        onLogout()
                    },
                    onSettingsClick = onSettingsClick,
                    onSizeRecommendationClick = onSizeRecommendationClick,
                    onEditProfileClick = onEditProfileClick,
                    onSkinPreferencesClick = onSkinPreferencesClick,
                    onPaymentMethodsClick = onPaymentMethodsClick,
                    onDeliveryAddressClick = onDeliveryAddressClick,
                    onSettingsPrivacyClick = onSettingsPrivacyClick,
                    onSkinComfortDiaryClick = onSkinComfortDiaryClick,
                    onVirtualClosetClick = onVirtualClosetClick
                )
                
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
fun ProfileHeader(
    onBackClick: () -> Unit, 
    name: String, 
    profileImage: Any?,
    onImageClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(
            onClick = onBackClick,
            modifier = Modifier.background(White, CircleShape).shadow(2.dp, CircleShape)
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = Color.Black)
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
            Text(
                text = stringResource(R.string.hello_user, name),
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold, color = Color.Black),
                maxLines = 1
            )
            Text(
                text = stringResource(R.string.home_subtitle),
                style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray)
            )
        }

        Box(
            modifier = Modifier
                .size(70.dp) // Increased size slightly
                .clip(CircleShape)
                .border(2.dp, AccentBlue, CircleShape)
                .clickable { onImageClick() }
        ) {
            AsyncImage(
                model = profileImage ?: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
                contentDescription = "Profile",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery),
                error = painterResource(id = android.R.drawable.ic_menu_report_image)
            )
            
            // Camera Overlay Icon - always visible now but more subtle
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.1f)),
                contentAlignment = Alignment.BottomCenter
            ) {
                Surface(
                    color = AccentBlue,
                    shape = CircleShape,
                    modifier = Modifier.padding(bottom = 4.dp).size(20.dp)
                ) {
                    Icon(
                        Icons.Default.CameraAlt, 
                        null, 
                        tint = White, 
                        modifier = Modifier.padding(4.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun ProfileInfoCard(onEditProfileClick: () -> Unit, profile: UserProfile?) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(stringResource(R.string.account_details), fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = Color.Black)
                Text(
                    text = stringResource(R.string.edit_all),
                    color = AccentBlue,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { onEditProfileClick() }
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            InfoRow("Full Name", profile?.fullName ?: "N/A", onClick = onEditProfileClick)
            InfoRow("Email", profile?.email ?: "N/A", onClick = onEditProfileClick)
            InfoRow("Profession", profile?.profession ?: "N/A", onClick = onEditProfileClick)
            InfoRow("Skin Type", profile?.skinType ?: "Sensitive", isHighlight = true, onClick = onEditProfileClick)
            InfoRow("Preferred Fabric", profile?.preferredFabric ?: "N/A", onClick = onEditProfileClick)
            InfoRow("Body Size", profile?.size ?: "N/A", onClick = onEditProfileClick)
            InfoRow("Location", profile?.location ?: "N/A", onClick = onEditProfileClick)
        }
    }
}

@Composable
fun InfoRow(label: String, value: String, isHighlight: Boolean = false, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(label, color = Color.Gray, fontSize = 12.sp)
            Text(
                value, 
                fontWeight = FontWeight.Medium, 
                fontSize = 15.sp,
                color = if (isHighlight) Color(0xFFE91E63) else Color.Black
            )
        }
        Icon(Icons.Default.Edit, null, modifier = Modifier.size(16.dp), tint = Color.LightGray)
    }
}

@Composable
fun AiComfortCard(score: Int) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .background(Brush.linearGradient(listOf(AccentBlue, Color(0xFF1A237E))))
                .padding(24.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(White.copy(alpha = 0.2f), CircleShape)
                    ) {
                        Icon(Icons.Default.AutoAwesome, null, modifier = Modifier.align(Alignment.Center).size(20.dp), tint = Color.Yellow)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = stringResource(R.string.ai_comfort_score, score), 
                        color = White, 
                        fontWeight = FontWeight.Bold, 
                        fontSize = 18.sp
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(stringResource(R.string.recommended_fabrics), color = White.copy(alpha = 0.7f), fontSize = 12.sp)
                Text("Cotton, Bamboo, Linen", color = White, fontWeight = FontWeight.SemiBold)
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Text(stringResource(R.string.avoid), color = White.copy(alpha = 0.7f), fontSize = 12.sp)
                Text("Rough Wool & Synthetic Fabric", color = Color(0xFFFFCDD2), fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
fun ActivityDashboard(
    onOrdersClick: () -> Unit,
    onWishlistClick: () -> Unit,
    onSavedItemsClick: () -> Unit,
    onRewardsClick: () -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 24.dp)) {
        Text(stringResource(R.string.activity_dashboard), fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = Color.Black)
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            DashboardItem(stringResource(R.string.orders), Icons.Default.LocalMall, Modifier.weight(1f), onOrdersClick)
            DashboardItem(stringResource(R.string.wishlist), Icons.Default.Favorite, Modifier.weight(1f), onWishlistClick)
        }
        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            DashboardItem(stringResource(R.string.saved), Icons.Default.Bookmark, Modifier.weight(1f), onSavedItemsClick)
            DashboardItem(stringResource(R.string.rewards), Icons.Default.Star, Modifier.weight(1f), onRewardsClick)
        }
    }
}

@Composable
fun DashboardItem(label: String, icon: ImageVector, modifier: Modifier, onClick: () -> Unit) {
    Surface(
        modifier = modifier,
        onClick = onClick,
        shape = RoundedCornerShape(20.dp),
        color = White,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, null, tint = AccentBlue)
            Spacer(modifier = Modifier.height(8.dp))
            Text(label, fontWeight = FontWeight.ExtraBold, fontSize = 14.sp, color = Color.Black)
        }
    }
}

@Composable
fun SettingsSection(
    onLogout: () -> Unit,
    onSettingsClick: () -> Unit,
    onSizeRecommendationClick: () -> Unit,
    onEditProfileClick: () -> Unit,
    onSkinPreferencesClick: () -> Unit,
    onPaymentMethodsClick: () -> Unit,
    onDeliveryAddressClick: () -> Unit,
    onSettingsPrivacyClick: () -> Unit,
    onSkinComfortDiaryClick: () -> Unit,
    onVirtualClosetClick: () -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 24.dp)) {
        Text(stringResource(R.string.settings_preferences), fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = Color.Black)
        Spacer(modifier = Modifier.height(12.dp))
        
        SettingItem("AI Virtual Closet", Icons.Default.Checkroom, onVirtualClosetClick)
        SettingItem("Skin Comfort Diary", Icons.Default.MenuBook, onSkinComfortDiaryClick)
        SettingItem("Edit Personal Information", Icons.Default.Person, onEditProfileClick)
        SettingItem("Manage Skin Preferences", Icons.Default.HealthAndSafety, onSkinPreferencesClick)
        SettingItem("Update Clothing Size", Icons.Default.Straighten, onSizeRecommendationClick)
        SettingItem("App Settings & Privacy", Icons.Default.Settings, onSettingsPrivacyClick)
        SettingItem("Payment Methods", Icons.Default.Payment, onPaymentMethodsClick)
        SettingItem("Delivery Address", Icons.Default.LocationOn, onDeliveryAddressClick)
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFEBEE)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text(stringResource(R.string.logout), color = Color.Red, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun SettingItem(title: String, icon: ImageVector, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        shape = RoundedCornerShape(16.dp),
        color = White.copy(alpha = 0.5f)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = AccentBlue, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Text(title, modifier = Modifier.weight(1f), fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = Color.Black)
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = Color.LightGray)
        }
    }
}
