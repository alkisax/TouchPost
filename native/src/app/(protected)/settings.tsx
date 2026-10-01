// native\src\app\(protected)\settings.tsx

// settings.tsx

import { View, Text, ScrollView } from 'react-native'
import { useContext } from 'react'
import { useRouter } from 'expo-router'
import { UserAuthContext } from '@/authLogin/context/UserAuthContext'
import { ThemeContext } from '@/context/ThemeContext'
import { createGlobalStyles } from '@/styles/global'
import { getEffectiveRole } from '@/authLogin/types/types'

const Settings = () => {
  const { user } = useContext(UserAuthContext)
  const { colors } = useContext(ThemeContext)
  const globalStyles = createGlobalStyles(colors)
  const router = useRouter()

  if (!user) return null

  const role = getEffectiveRole(user)
  

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>

        <Text style={[globalStyles.title, { marginBottom: 20 }]}>
          Settings
        </Text>

        {/* USER INFO */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.text }}>Username: {user.username}</Text>
          <Text style={{ color: colors.textSecondary }}>
            Role: {role}
          </Text>
        </View>

        {/* The canonical password-confirmed self-delete flow lives in Account. */}
        <Text
          onPress={() => router.push('/account')}
          style={[globalStyles.link, { marginTop: 20 }]}
        >
          Manage account and delete account
        </Text>

      </ScrollView>
    </View>
  )
}

export default Settings
