package com.example.best3.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.IgnoreExtraProperties
import kotlinx.coroutines.tasks.await

@IgnoreExtraProperties
data class UserProfile(
    val email: String? = null,
    val fullName: String? = null,
    val profession: String? = null,
    val age: String? = null,
    val size: String? = null,
    val skinType: String? = null,
    val preferredFabric: String? = null,
    val location: String? = null,
    val fashionStyle: String? = null,
    val comfortScore: Int = 92
)

object FirebaseManager {
    private val auth = FirebaseAuth.getInstance()
    private val db get() = FirebaseFirestore.getInstance()
    private val usersCollection get() = db.collection("users")

    // Mutable profile state — scoped to navigation lifecycle via ViewModel in production
    @Volatile
    var tempProfile = UserProfile()

    val currentUser get() = auth.currentUser

    fun isUserLoggedIn(): Boolean = auth.currentUser != null

    fun logout() {
        auth.signOut()
    }

    /**
     * Delete Auth account FIRST, then Firestore data.
     * If Firestore delete fails, the account is still removed (recoverable).
     */
    suspend fun deleteUserAccount(): Result<Unit> {
        val user = auth.currentUser ?: return Result.failure(Exception("User not logged in"))
        val userId = user.uid

        return try {
            // 1. Delete Auth Account first (may require recent re-authentication)
            user.delete().await()
            // 2. Then delete Firestore Data
            try {
                usersCollection.document(userId).delete().await()
            } catch (_: Exception) {
                // Firestore delete failed but Auth account is gone — acceptable
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signInWithGoogle(idToken: String): Result<Unit> {
        return try {
            val credential = GoogleAuthProvider.getCredential(idToken, null)
            auth.signInWithCredential(credential).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun saveUserProfile(profile: UserProfile): Result<Unit> {
        val userId = auth.currentUser?.uid ?: return Result.failure(Exception("User not logged in"))
        return try {
            usersCollection.document(userId).set(profile, com.google.firebase.firestore.SetOptions.merge()).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getUserProfile(): Result<UserProfile?> {
        val userId = auth.currentUser?.uid ?: return Result.failure(Exception("User not logged in"))
        return try {
            val snapshot = usersCollection.document(userId).get().await()
            val data = snapshot.data
            if (data != null) {
                Result.success(UserProfile(
                    email = data["email"] as? String,
                    fullName = data["fullName"] as? String,
                    profession = data["profession"] as? String,
                    age = data["age"] as? String,
                    size = data["size"] as? String,
                    skinType = data["skinType"] as? String,
                    preferredFabric = data["preferredFabric"] as? String,
                    location = data["location"] as? String,
                    fashionStyle = data["fashionStyle"] as? String,
                    comfortScore = (data["comfortScore"] as? Number)?.toInt() ?: 92
                ))
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // --- VIRTUAL CLOSET METHODS ---

    suspend fun getClosetItems(): Result<List<Map<String, Any>>> {
        val userId = auth.currentUser?.uid ?: return Result.failure(Exception("User not logged in"))
        return try {
            val snapshot = usersCollection.document(userId).collection("closet").get().await()
            val items = snapshot.documents.map { doc ->
                val data = doc.data?.toMutableMap() ?: mutableMapOf()
                data["id"] = doc.id
                data
            }
            Result.success(items)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addClosetItem(name: String, category: String, imageUrl: String): Result<String> {
        val userId = auth.currentUser?.uid ?: return Result.failure(Exception("User not logged in"))
        return try {
            val item = mapOf(
                "name" to name,
                "category" to category,
                "imageUrl" to imageUrl,
                "timestamp" to com.google.firebase.Timestamp.now()
            )
            val docRef = usersCollection.document(userId).collection("closet").add(item).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteClosetItem(itemId: String): Result<Unit> {
        val userId = auth.currentUser?.uid ?: return Result.failure(Exception("User not logged in"))
        return try {
            usersCollection.document(userId).collection("closet").document(itemId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
