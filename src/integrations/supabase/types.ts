export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ad_banners: {
        Row: {
          ativo: boolean
          codigo_html_desktop: string
          codigo_html_mobile: string
          created_at: string
          id: string
          image_desktop_url: string | null
          image_mobile_url: string | null
          link_url: string | null
          nome_interno: string
          peso_sorteio: number
          placement: Database["public"]["Enums"]["ad_placement"]
          plano: Database["public"]["Enums"]["ad_plano"] | null
          tipo_anuncio: Database["public"]["Enums"]["ad_tipo"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo_html_desktop: string
          codigo_html_mobile: string
          created_at?: string
          id?: string
          image_desktop_url?: string | null
          image_mobile_url?: string | null
          link_url?: string | null
          nome_interno: string
          peso_sorteio?: number
          placement?: Database["public"]["Enums"]["ad_placement"]
          plano?: Database["public"]["Enums"]["ad_plano"] | null
          tipo_anuncio?: Database["public"]["Enums"]["ad_tipo"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo_html_desktop?: string
          codigo_html_mobile?: string
          created_at?: string
          id?: string
          image_desktop_url?: string | null
          image_mobile_url?: string | null
          link_url?: string | null
          nome_interno?: string
          peso_sorteio?: number
          placement?: Database["public"]["Enums"]["ad_placement"]
          plano?: Database["public"]["Enums"]["ad_plano"] | null
          tipo_anuncio?: Database["public"]["Enums"]["ad_tipo"]
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_accounts: {
        Row: {
          block_reason: string | null
          coins: number
          created_at: string
          credits_pool_pending: number
          dantes_pool_pending: number
          is_blocked: boolean
          referral_code: string
          user_id: string
        }
        Insert: {
          block_reason?: string | null
          coins?: number
          created_at?: string
          credits_pool_pending?: number
          dantes_pool_pending?: number
          is_blocked?: boolean
          referral_code: string
          user_id: string
        }
        Update: {
          block_reason?: string | null
          coins?: number
          created_at?: string
          credits_pool_pending?: number
          dantes_pool_pending?: number
          is_blocked?: boolean
          referral_code?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_custom_rules: {
        Row: {
          ambassador_id: string
          created_at: string
          credits_coins_per: number | null
          credits_threshold: number | null
          dantes_coins_per: number | null
          dantes_threshold: number | null
          id: string
          plan_coins_override: Json | null
          signup_coins: number | null
          visit_batch_coins: number | null
          visit_batch_size: number | null
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          credits_coins_per?: number | null
          credits_threshold?: number | null
          dantes_coins_per?: number | null
          dantes_threshold?: number | null
          id?: string
          plan_coins_override?: Json | null
          signup_coins?: number | null
          visit_batch_coins?: number | null
          visit_batch_size?: number | null
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          credits_coins_per?: number | null
          credits_threshold?: number | null
          dantes_coins_per?: number | null
          dantes_threshold?: number | null
          id?: string
          plan_coins_override?: Json | null
          signup_coins?: number | null
          visit_batch_coins?: number | null
          visit_batch_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_custom_rules_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: true
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      affiliate_earnings: {
        Row: {
          ambassador_id: string
          amount: number
          created_at: string
          id: string
          source_description: string
          source_type: string
        }
        Insert: {
          ambassador_id: string
          amount: number
          created_at?: string
          id?: string
          source_description?: string
          source_type: string
        }
        Update: {
          ambassador_id?: string
          amount?: number
          created_at?: string
          id?: string
          source_description?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_earnings_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      affiliate_notifications: {
        Row: {
          ambassador_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_notifications_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      affiliate_redemptions: {
        Row: {
          admin_note: string | null
          ambassador_id: string
          coins_cost: number
          created_at: string
          dantes_amount: number | null
          id: string
          item_name: string
          pix_key: string | null
          pix_key_type: string | null
          redemption_type: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          ambassador_id: string
          coins_cost: number
          created_at?: string
          dantes_amount?: number | null
          id?: string
          item_name?: string
          pix_key?: string | null
          pix_key_type?: string | null
          redemption_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          ambassador_id?: string
          coins_cost?: number
          created_at?: string
          dantes_amount?: number | null
          id?: string
          item_name?: string
          pix_key?: string | null
          pix_key_type?: string | null
          redemption_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_redemptions_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          ambassador_id: string
          created_at: string
          credits_pending: number
          id: string
          is_manual: boolean
          referred_id: string
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          credits_pending?: number
          id?: string
          is_manual?: boolean
          referred_id: string
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          credits_pending?: number
          id?: string
          is_manual?: boolean
          referred_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      affiliate_scratch_cards: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          multiplier: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          multiplier?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          multiplier?: number
        }
        Relationships: []
      }
      affiliate_scratch_grants: {
        Row: {
          admin_id: string | null
          ambassador_id: string
          created_at: string
          extra_tickets: number
          id: string
          note: string | null
        }
        Insert: {
          admin_id?: string | null
          ambassador_id: string
          created_at?: string
          extra_tickets: number
          id?: string
          note?: string | null
        }
        Update: {
          admin_id?: string | null
          ambassador_id?: string
          created_at?: string
          extra_tickets?: number
          id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_scratch_grants_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      affiliate_shop_items: {
        Row: {
          coins_cost: number
          created_at: string
          dantes_amount: number | null
          description: string
          id: string
          is_active: boolean
          name: string
          redemption_type: string
          sort_order: number
        }
        Insert: {
          coins_cost: number
          created_at?: string
          dantes_amount?: number | null
          description?: string
          id?: string
          is_active?: boolean
          name: string
          redemption_type: string
          sort_order?: number
        }
        Update: {
          coins_cost?: number
          created_at?: string
          dantes_amount?: number | null
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          redemption_type?: string
          sort_order?: number
        }
        Relationships: []
      }
      affiliate_user_scratch_cards: {
        Row: {
          ambassador_id: string
          card_id: string
          code: string
          coins_paid: number
          expires_at: string
          id: string
          multiplier: number
          obtained_by: string
          revealed_at: string
        }
        Insert: {
          ambassador_id: string
          card_id: string
          code: string
          coins_paid?: number
          expires_at: string
          id?: string
          multiplier: number
          obtained_by: string
          revealed_at?: string
        }
        Update: {
          ambassador_id?: string
          card_id?: string
          code?: string
          coins_paid?: number
          expires_at?: string
          id?: string
          multiplier?: number
          obtained_by?: string
          revealed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_user_scratch_cards_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "affiliate_user_scratch_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "affiliate_scratch_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_visits: {
        Row: {
          ambassador_id: string
          created_at: string
          id: string
          retained: boolean
          visit_date: string
          visitor_ip: string
          visitor_session: string
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          id?: string
          retained?: boolean
          visit_date?: string
          visitor_ip?: string
          visitor_session?: string
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          id?: string
          retained?: boolean
          visit_date?: string
          visitor_ip?: string
          visitor_session?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_visits_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      archived_chapters: {
        Row: {
          archive_reason: string
          body: string
          category_id: string | null
          chapter_number: number
          created_at: string
          id: string
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          archive_reason?: string
          body: string
          category_id?: string | null
          chapter_number: number
          created_at?: string
          id?: string
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          archive_reason?: string
          body?: string
          category_id?: string | null
          chapter_number?: number
          created_at?: string
          id?: string
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "archived_chapters_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "library_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      card_codes: {
        Row: {
          card_id: string
          code: string
          created_at: string
          redeemed_at: string | null
          redeemed_by: string | null
        }
        Insert: {
          card_id: string
          code: string
          created_at?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Update: {
          card_id?: string
          code?: string
          created_at?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_codes_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          created_at: string
          description: string
          id: string
          locked_hint: string
          name: string
          number: number
          photo_url: string
          points: number
          sort_order: number
          type: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          locked_hint?: string
          name: string
          number?: number
          photo_url?: string
          points?: number
          sort_order?: number
          type?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          locked_hint?: string
          name?: string
          number?: number
          photo_url?: string
          points?: number
          sort_order?: number
          type?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          created_at: string
          id: string
          name: string
          photo_url: string
          presentation: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          photo_url?: string
          presentation?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photo_url?: string
          presentation?: string
          sort_order?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          imported_at: string | null
          role: string
          sarcasm_score: number | null
          source: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          imported_at?: string | null
          role: string
          sarcasm_score?: number | null
          source?: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          imported_at?: string | null
          role?: string
          sarcasm_score?: number | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      chatstories: {
        Row: {
          cover_url: string
          created_at: string
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          synopsis: string
          title: string
        }
        Insert: {
          cover_url?: string
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          synopsis?: string
          title: string
        }
        Update: {
          cover_url?: string
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          synopsis?: string
          title?: string
        }
        Relationships: []
      }
      chatstory_chapters: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          story_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          story_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          story_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatstory_chapters_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "chatstories"
            referencedColumns: ["id"]
          },
        ]
      }
      chatstory_characters: {
        Row: {
          avatar_url: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          avatar_url?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      chatstory_elements: {
        Row: {
          ad_tags: string[] | null
          chapter_id: string
          character_id: string | null
          content: string
          created_at: string
          id: string
          kind: string
          side: string | null
          sort_order: number
        }
        Insert: {
          ad_tags?: string[] | null
          chapter_id: string
          character_id?: string | null
          content: string
          created_at?: string
          id?: string
          kind: string
          side?: string | null
          sort_order?: number
        }
        Update: {
          ad_tags?: string[] | null
          chapter_id?: string
          character_id?: string | null
          content?: string
          created_at?: string
          id?: string
          kind?: string
          side?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "chatstory_elements_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chatstory_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatstory_elements_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "chatstory_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_retention_rules: {
        Row: {
          ambassador_id: string
          created_at: string
          description: string
          destinations: Json
          id: string
          is_active: boolean
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          description?: string
          destinations?: Json
          id?: string
          is_active?: boolean
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          description?: string
          destinations?: Json
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "coin_retention_rules_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      dante_breaks: {
        Row: {
          created_at: string
          days: number[]
          end_time: string
          id: string
          is_active: boolean
          message: string
          name: string
          start_time: string
        }
        Insert: {
          created_at?: string
          days?: number[]
          end_time: string
          id?: string
          is_active?: boolean
          message: string
          name: string
          start_time: string
        }
        Update: {
          created_at?: string
          days?: number[]
          end_time?: string
          id?: string
          is_active?: boolean
          message?: string
          name?: string
          start_time?: string
        }
        Relationships: []
      }
      dante_knowledge: {
        Row: {
          created_at: string
          id: string
          instruction: string
          is_active: boolean
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          instruction?: string
          is_active?: boolean
          sort_order?: number
          title?: string
        }
        Update: {
          created_at?: string
          id?: string
          instruction?: string
          is_active?: boolean
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      dante_wallet: {
        Row: {
          balance: number
          id: number
          last_yield_at: string
          updated_at: string
          yield_pct: number
          yield_period: string
        }
        Insert: {
          balance?: number
          id?: number
          last_yield_at?: string
          updated_at?: string
          yield_pct?: number
          yield_period?: string
        }
        Update: {
          balance?: number
          id?: number
          last_yield_at?: string
          updated_at?: string
          yield_pct?: number
          yield_period?: string
        }
        Relationships: []
      }
      dante_wallet_auto_dist: {
        Row: {
          ambassador_id: string
          created_at: string
          id: string
          is_active: boolean
          note: string
          percent: number
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          note?: string
          percent: number
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          note?: string
          percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "dante_wallet_auto_dist_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "affiliate_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      dante_wallet_ledger: {
        Row: {
          ambassador_id: string | null
          amount: number
          created_at: string
          description: string
          id: string
          kind: string
        }
        Insert: {
          ambassador_id?: string | null
          amount: number
          created_at?: string
          description?: string
          id?: string
          kind: string
        }
        Update: {
          ambassador_id?: string | null
          amount?: number
          created_at?: string
          description?: string
          id?: string
          kind?: string
        }
        Relationships: []
      }
      faq_entries: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      game_wins: {
        Row: {
          created_at: string | null
          game_id: string
          game_type: string
          id: string
          reward_dantes: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          game_id: string
          game_type: string
          id?: string
          reward_dantes: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          game_id?: string
          game_type?: string
          id?: string
          reward_dantes?: number
          user_id?: string
        }
        Relationships: []
      }
      hangman_games: {
        Row: {
          created_at: string | null
          hint: string
          id: string
          is_active: boolean | null
          reward_dantes: number
          secret_word: string
        }
        Insert: {
          created_at?: string | null
          hint?: string
          id?: string
          is_active?: boolean | null
          reward_dantes?: number
          secret_word: string
        }
        Update: {
          created_at?: string | null
          hint?: string
          id?: string
          is_active?: boolean | null
          reward_dantes?: number
          secret_word?: string
        }
        Relationships: []
      }
      library_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      manual_grants: {
        Row: {
          admin_id: string | null
          card_id: string | null
          created_at: string
          id: string
          kind: string
          points: number | null
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          card_id?: string | null
          created_at?: string
          id?: string
          kind: string
          points?: number | null
          user_id: string
        }
        Update: {
          admin_id?: string | null
          card_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_grants_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birthdate: string | null
          created_at: string
          credits: number | null
          full_name: string
          id: string
          last_message_date: string | null
          messages_today: number
          phone: string
          plan: string
          plan_expires_at: string | null
          points: number
          role: string
        }
        Insert: {
          birthdate?: string | null
          created_at?: string
          credits?: number | null
          full_name?: string
          id: string
          last_message_date?: string | null
          messages_today?: number
          phone?: string
          plan?: string
          plan_expires_at?: string | null
          points?: number
          role?: string
        }
        Update: {
          birthdate?: string | null
          created_at?: string
          credits?: number | null
          full_name?: string
          id?: string
          last_message_date?: string | null
          messages_today?: number
          phone?: string
          plan?: string
          plan_expires_at?: string | null
          points?: number
          role?: string
        }
        Relationships: []
      }
      puzzle_games: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          piece_count: number
          reward_dantes: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          piece_count?: number
          reward_dantes?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          piece_count?: number
          reward_dantes?: number
        }
        Relationships: []
      }
      quiz_groups: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          reward_dantes: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          reward_dantes?: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          reward_dantes?: number
          title?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_index: number
          created_at: string | null
          group_id: string
          id: string
          options: Json
          question: string
          sort_order: number | null
        }
        Insert: {
          correct_index: number
          created_at?: string | null
          group_id: string
          id?: string
          options: Json
          question: string
          sort_order?: number | null
        }
        Update: {
          correct_index?: number
          created_at?: string | null
          group_id?: string
          id?: string
          options?: Json
          question?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "quiz_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      secrets: {
        Row: {
          body: string
          created_at: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          card_id: string | null
          created_at: string | null
          credits_amount: number | null
          credits_validity_days: number | null
          description: string
          file_url: string | null
          id: string
          is_active: boolean | null
          name: string
          price_dantes: number
          reward_type: string
          stock: number
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          credits_amount?: number | null
          credits_validity_days?: number | null
          description?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_dantes?: number
          reward_type: string
          stock?: number
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          credits_amount?: number | null
          credits_validity_days?: number | null
          description?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_dantes?: number
          reward_type?: string
          stock?: number
        }
        Relationships: []
      }
      shop_redemptions: {
        Row: {
          id: string
          item_id: string
          redeemed_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          redeemed_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          redeemed_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_redemptions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          composition: string
          created_at: string
          id: string
          listener: string
          sort_order: number
          title: string
          youtube_url: string
        }
        Insert: {
          composition?: string
          created_at?: string
          id?: string
          listener?: string
          sort_order?: number
          title: string
          youtube_url?: string
        }
        Update: {
          composition?: string
          created_at?: string
          id?: string
          listener?: string
          sort_order?: number
          title?: string
          youtube_url?: string
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          answer: string
          created_at: string
          id: string
          reviewed_at: string | null
          reviewer_feedback: string | null
          status: string
          task_id: string
          user_id: string
        }
        Insert: {
          answer?: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewer_feedback?: string | null
          status?: string
          task_id: string
          user_id?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewer_feedback?: string | null
          status?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string
          id: string
          points: number
          question: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          points?: number
          question?: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          points?: number
          question?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      user_cards: {
        Row: {
          card_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      spotlights: {
        Row: {
          ativo: boolean | null
          codigo_html_desktop: string | null
          codigo_html_mobile: string | null
          created_at: string | null
          id: string | null
          image_desktop_url: string | null
          image_mobile_url: string | null
          link_url: string | null
          nome_interno: string | null
          peso_sorteio: number | null
          placement: Database["public"]["Enums"]["ad_placement"] | null
          plano: Database["public"]["Enums"]["ad_plano"] | null
          tipo_anuncio: Database["public"]["Enums"]["ad_tipo"] | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo_html_desktop?: string | null
          codigo_html_mobile?: string | null
          created_at?: string | null
          id?: string | null
          image_desktop_url?: string | null
          image_mobile_url?: string | null
          link_url?: string | null
          nome_interno?: string | null
          peso_sorteio?: number | null
          placement?: Database["public"]["Enums"]["ad_placement"] | null
          plano?: Database["public"]["Enums"]["ad_plano"] | null
          tipo_anuncio?: Database["public"]["Enums"]["ad_tipo"] | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo_html_desktop?: string | null
          codigo_html_mobile?: string | null
          created_at?: string | null
          id?: string | null
          image_desktop_url?: string | null
          image_mobile_url?: string | null
          link_url?: string | null
          nome_interno?: string | null
          peso_sorteio?: number | null
          placement?: Database["public"]["Enums"]["ad_placement"] | null
          plano?: Database["public"]["Enums"]["ad_plano"] | null
          tipo_anuncio?: Database["public"]["Enums"]["ad_tipo"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _apply_retention: {
        Args: { p_amb: string; p_base: number; p_rule: string }
        Returns: number
      }
      _wallet_credit: {
        Args: {
          p_amb?: string
          p_amount: number
          p_desc: string
          p_kind: string
        }
        Returns: undefined
      }
      activate_subscription_plan: {
        Args: { p_expires_at: string; p_plan: string; p_user_id: string }
        Returns: Json
      }
      admin_affiliate_adjust_coins: {
        Args: { p_ambassador_id: string; p_amount: number; p_reason?: string }
        Returns: Json
      }
      admin_affiliate_block: {
        Args: { p_ambassador_id: string; p_blocked: boolean; p_reason?: string }
        Returns: Json
      }
      admin_affiliate_performance: {
        Args: { p_ambassador_id: string }
        Returns: Json
      }
      admin_affiliate_send_notification: {
        Args: {
          p_ambassador_id: string
          p_message: string
          p_title: string
          p_type: string
        }
        Returns: Json
      }
      admin_affiliate_set_custom_rule: {
        Args: {
          p_ambassador_id: string
          p_credits_coins_per?: number
          p_credits_threshold?: number
          p_dantes_coins_per?: number
          p_dantes_threshold?: number
          p_plan_coins_override?: Json
          p_signup_coins?: number
          p_visit_batch_coins?: number
          p_visit_batch_size?: number
        }
        Returns: Json
      }
      admin_affiliate_update_redemption: {
        Args: { p_note?: string; p_redemption_id: string; p_status: string }
        Returns: Json
      }
      admin_attach_referral: {
        Args: { p_ambassador_id: string; p_referred_id: string }
        Returns: Json
      }
      admin_create_retention: {
        Args: {
          p_ambassador_id: string
          p_description: string
          p_destinations: Json
          p_retain_existing?: boolean
        }
        Returns: Json
      }
      admin_delete_retention: { Args: { p_id: string }; Returns: Json }
      admin_grant_card: {
        Args: { p_card_id: string; p_user_id: string }
        Returns: Json
      }
      admin_grant_dantes: {
        Args: { amount: number; target_user: string }
        Returns: undefined
      }
      admin_grant_points: {
        Args: { p_amount: number; p_user_id: string }
        Returns: Json
      }
      admin_grant_scratch_tickets: {
        Args: { p_ambassador_id: string; p_amount: number; p_note?: string }
        Returns: Json
      }
      admin_list_ambassadors: { Args: never; Returns: Json }
      admin_read_redemptions: {
        Args: never
        Returns: {
          id: string
          item_id: string
          redeemed_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "shop_redemptions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_remove_referral: { Args: { p_referral_id: string }; Returns: Json }
      admin_save_custom_rules: {
        Args: {
          p_ambassador_id: string
          p_credits_coins_per?: number
          p_credits_threshold?: number
          p_dantes_coins_per?: number
          p_dantes_threshold?: number
          p_plan_coins_override?: Json
          p_signup_coins?: number
          p_visit_batch_coins?: number
          p_visit_batch_size?: number
        }
        Returns: Json
      }
      admin_set_plan: {
        Args: { p_expires_at: string; p_plan: string; p_user_id: string }
        Returns: Json
      }
      admin_set_scratch_event: { Args: { p_active: boolean }; Returns: Json }
      admin_toggle_retention: {
        Args: { p_active: boolean; p_id: string }
        Returns: Json
      }
      admin_wallet_add_autodist: {
        Args: { p_ambassador_id: string; p_note?: string; p_percent: number }
        Returns: Json
      }
      admin_wallet_remove_autodist: { Args: { p_id: string }; Returns: Json }
      admin_wallet_set_yield: {
        Args: { p_pct: number; p_period: string }
        Returns: Json
      }
      admin_wallet_transfer: {
        Args: { p_ambassador_id: string; p_amount: number; p_note?: string }
        Returns: Json
      }
      affiliate_active_multiplier: {
        Args: { p_ambassador_id: string }
        Returns: number
      }
      affiliate_add_credits_to_pool: {
        Args: { p_ambassador_id: string; p_credits: number; p_desc?: string }
        Returns: Json
      }
      affiliate_add_dantes_to_pool: {
        Args: { p_ambassador_id: string; p_dantes: number; p_desc?: string }
        Returns: Json
      }
      affiliate_my_stats: { Args: never; Returns: Json }
      affiliate_redeem: {
        Args: { p_item_id: string; p_pix_key?: string; p_pix_key_type?: string }
        Returns: Json
      }
      affiliate_scratch_draw: { Args: never; Returns: Json }
      affiliate_scratch_event_active: { Args: never; Returns: boolean }
      affiliate_scratch_status: { Args: never; Returns: Json }
      approve_task: { Args: { p_submission_id: string }; Returns: Json }
      award_game_win: {
        Args: { p_game_id: string; p_game_type: string; p_reward: number }
        Returns: Json
      }
      award_referral_credits: {
        Args: { p_credits_used: number; p_referred_id: string }
        Returns: Json
      }
      award_referral_dantes: {
        Args: { p_dantes_amount: number; p_referred_id: string }
        Returns: Json
      }
      award_referral_signup: { Args: { p_referred_id: string }; Returns: Json }
      award_referral_subscription: {
        Args: { p_plan: string; p_referred_id: string }
        Returns: Json
      }
      become_ambassador: { Args: never; Returns: Json }
      check_affiliate_account: { Args: never; Returns: Json }
      confirm_visit_retention: { Args: { p_visit_id: string }; Returns: Json }
      dante_wallet_apply_yield: { Args: never; Returns: Json }
      ensure_affiliate_account: {
        Args: never
        Returns: {
          block_reason: string | null
          coins: number
          created_at: string
          credits_pool_pending: number
          dantes_pool_pending: number
          is_blocked: boolean
          referral_code: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "affiliate_accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ensure_daily_credits: { Args: never; Returns: number }
      generate_referral_code: { Args: never; Returns: string }
      get_vault_secret: { Args: { secret_name: string }; Returns: string }
      import_lovable_conversation: {
        Args: { p_messages: Json; p_user_id: string }
        Returns: Json
      }
      increment_message_count: { Args: { p_uid: string }; Returns: undefined }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { check_uid: string }; Returns: boolean }
      is_subscriber: { Args: { p_user_id: string }; Returns: boolean }
      link_referral: {
        Args: { p_referral_code: string; p_referred_id: string }
        Returns: Json
      }
      plan_daily_limit: {
        Args: { p_expires: string; p_plan: string }
        Returns: number
      }
      redeem_card_code: { Args: { p_code: string }; Returns: Json }
      redeem_shop_item: { Args: { p_item_id: string }; Returns: Json }
      reject_task: {
        Args: { p_feedback?: string; p_submission_id: string }
        Returns: Json
      }
      reset_daily_credits: { Args: never; Returns: undefined }
      reset_daily_messages: { Args: { p_uid: string }; Returns: number }
      seed_admin: { Args: never; Returns: Json }
      track_affiliate_visit: {
        Args: { p_code: string; p_ip_hash?: string; p_session?: string }
        Returns: Json
      }
      track_referral_credit_use: {
        Args: { p_credits?: number; p_referred_id: string }
        Returns: Json
      }
    }
    Enums: {
      ad_placement: "home" | "html" | "infeed"
      ad_plano: "bronze" | "prata" | "ouro"
      ad_tipo: "ad" | "pub"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ad_placement: ["home", "html", "infeed"],
      ad_plano: ["bronze", "prata", "ouro"],
      ad_tipo: ["ad", "pub"],
    },
  },
} as const
