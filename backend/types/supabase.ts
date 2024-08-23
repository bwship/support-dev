export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      address: {
        Row: {
          city: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: number
          is_active: boolean
          location: unknown | null
          profile_id: number | null
          state: string
          street_address_1: string
          street_address_2: string | null
          type: string | null
          updated_at: string | null
          updated_by: string | null
          zip: string
        }
        Insert: {
          city: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: number
          is_active?: boolean
          location?: unknown | null
          profile_id?: number | null
          state: string
          street_address_1: string
          street_address_2?: string | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          zip: string
        }
        Update: {
          city?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: number
          is_active?: boolean
          location?: unknown | null
          profile_id?: number | null
          state?: string
          street_address_1?: string
          street_address_2?: string | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["parent_profile_id"]
          },
          {
            foreignKeyName: "address_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_type_fkey"
            columns: ["type"]
            referencedRelation: "lookup_address_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_type_fkey"
            columns: ["type"]
            referencedRelation: "vw_lookup_address_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      config: {
        Row: {
          key: string | null
          value: string | null
        }
        Insert: {
          key?: string | null
          value?: string | null
        }
        Update: {
          key?: string | null
          value?: string | null
        }
        Relationships: []
      }
      event: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: number
          is_active: boolean
          name: string
          start_date: string | null
          team_id: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
          start_date?: string | null
          team_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
          start_date?: string | null
          team_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      event_processing: {
        Row: {
          created_at: string
          created_by: string | null
          deactivated_at: string | null
          deactivated_by: string | null
          event_id: number
          id: number
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          event_id: number
          id?: number
          status: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          event_id?: number
          id?: number
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_processing_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_processing_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_processing_deactivated_by_fkey"
            columns: ["deactivated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_processing_deactivated_by_fkey"
            columns: ["deactivated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_processing_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_processing_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_processing_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event_helper"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_processing_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event_with_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_processing_status_fkey"
            columns: ["status"]
            referencedRelation: "lookup_event_processing_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_processing_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_processing_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      event_step: {
        Row: {
          attributes: Json | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          event_id: number
          id: number
          is_active: boolean
          notes: string | null
          parent_step_id: number | null
          type: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          attributes?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_id: number
          id?: number
          is_active?: boolean
          notes?: string | null
          parent_step_id?: number | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          attributes?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_id?: number
          id?: number
          is_active?: boolean
          notes?: string | null
          parent_step_id?: number | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_step_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event_helper"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event_with_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_parent_step_id_fkey"
            columns: ["parent_step_id"]
            referencedRelation: "event_step"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_parent_step_id_fkey"
            columns: ["parent_step_id"]
            referencedRelation: "vw_event_step"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_type_fkey"
            columns: ["type"]
            referencedRelation: "lookup_step_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_type_fkey"
            columns: ["type"]
            referencedRelation: "vw_lookup_step_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      event_step_request: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          event_step_id: number
          id: number
          notes: string | null
          profile_id: number
          ranking: number | null
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_step_id: number
          id?: number
          notes?: string | null
          profile_id: number
          ranking?: number | null
          status: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_step_id?: number
          id?: number
          notes?: string | null
          profile_id?: number
          ranking?: number | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_step_request_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_event_step_id_fkey"
            columns: ["event_step_id"]
            referencedRelation: "event_step"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_event_step_id_fkey"
            columns: ["event_step_id"]
            referencedRelation: "vw_event_step"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["parent_profile_id"]
          },
          {
            foreignKeyName: "event_step_request_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_status_fkey"
            columns: ["status"]
            referencedRelation: "lookup_invite_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_status_fkey"
            columns: ["status"]
            referencedRelation: "vw_lookup_invite_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      lookup_address_type: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_address_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_address_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_address_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_address_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_address_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_address_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      lookup_event_processing_status: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_event_processing_status_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_event_processing_status_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_event_processing_status_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_event_processing_status_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_event_processing_status_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_event_processing_status_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      lookup_family_member_type: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_family_member_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_family_member_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_family_member_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_family_member_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_family_member_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_family_member_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      lookup_invite_status: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_invite_status_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_invite_status_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_invite_status_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_invite_status_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_invite_status_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_invite_status_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      lookup_notification_channel: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_notification_channel_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_notification_channel_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_notification_channel_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_notification_channel_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_notification_channel_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_notification_channel_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      lookup_notification_status: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_notification_status_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_notification_status_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_notification_status_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_notification_status_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_notification_status_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_notification_status_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      lookup_pet_type: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_pet_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_pet_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_pet_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_pet_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_pet_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_pet_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      lookup_step_type: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_step_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_step_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_step_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_step_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_step_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_step_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      lookup_transportation_rule: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_transportation_rule_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_transportation_rule_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_transportation_rule_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_transportation_rule_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_transportation_rule_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_transportation_rule_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      notification: {
        Row: {
          channel: string
          content: string
          created_at: string
          created_by: string | null
          id: number
          profile_id: number
          proof: string | null
          sent_at: string | null
          sent_by: string | null
          status: string
          subject: string | null
          traceback: string
        }
        Insert: {
          channel: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: number
          profile_id: number
          proof?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status: string
          subject?: string | null
          traceback: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: number
          profile_id?: number
          proof?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject?: string | null
          traceback?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_channel_fkey"
            columns: ["channel"]
            referencedRelation: "lookup_notification_channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_sent_by_fkey"
            columns: ["sent_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_sent_by_fkey"
            columns: ["sent_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_status_fkey"
            columns: ["status"]
            referencedRelation: "lookup_notification_status"
            referencedColumns: ["id"]
          }
        ]
      }
      profile: {
        Row: {
          attributes: Json | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          first_name: string | null
          id: number
          is_active: boolean
          last_name: string | null
          profile_url: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          attributes?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          first_name?: string | null
          id?: number
          is_active?: boolean
          last_name?: string | null
          profile_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          attributes?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          first_name?: string | null
          id?: number
          is_active?: boolean
          last_name?: string | null
          profile_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      profile_location: {
        Row: {
          location: unknown | null
          profile_id: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          location?: unknown | null
          profile_id: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          location?: unknown | null
          profile_id?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_location_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_location_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_location_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["parent_profile_id"]
          },
          {
            foreignKeyName: "profile_location_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["id"]
          }
        ]
      }
      relationship: {
        Row: {
          attributes: Json | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: number
          is_active: boolean
          parent_profile_id: number | null
          profile_id: number | null
          roles: Database["public"]["Enums"]["role"][] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          attributes?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          is_active?: boolean
          parent_profile_id?: number | null
          profile_id?: number | null
          roles?: Database["public"]["Enums"]["role"][] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          attributes?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          is_active?: boolean
          parent_profile_id?: number | null
          profile_id?: number | null
          roles?: Database["public"]["Enums"]["role"][] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["parent_profile_id"]
          },
          {
            foreignKeyName: "relationship_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["parent_profile_id"]
          },
          {
            foreignKeyName: "relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      team: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: number
          is_active: boolean
          name: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          is_active?: boolean
          name?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          is_active?: boolean
          name?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      team_relationship: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: number
          is_active: boolean
          profile_id: number | null
          relationship_id: number | null
          team_id: number | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          is_active?: boolean
          profile_id?: number | null
          relationship_id?: number | null
          team_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: number
          is_active?: boolean
          profile_id?: number | null
          relationship_id?: number | null
          team_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_relationship_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["parent_profile_id"]
          },
          {
            foreignKeyName: "team_relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_relationship_id_fkey"
            columns: ["relationship_id"]
            referencedRelation: "relationship"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      vw_address: {
        Row: {
          city: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: number | null
          is_active: boolean | null
          location: unknown | null
          profile_id: number | null
          state: string | null
          street_address_1: string | null
          street_address_2: string | null
          team_id: number | null
          team_name: string | null
          type: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
          zip: string | null
        }
        Relationships: [
          {
            foreignKeyName: "address_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["parent_profile_id"]
          },
          {
            foreignKeyName: "address_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_type_fkey"
            columns: ["type"]
            referencedRelation: "lookup_address_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_type_fkey"
            columns: ["type"]
            referencedRelation: "vw_lookup_address_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "team"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_event: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: number | null
          is_active: boolean | null
          name: string | null
          start_date: string | null
          team_id: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: number | null
          is_active?: boolean | null
          name?: string | null
          start_date?: string | null
          team_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: number | null
          is_active?: boolean | null
          name?: string | null
          start_date?: string | null
          team_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_event_helper: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          helper_ids: number[] | null
          id: number | null
          is_active: boolean | null
          name: string | null
          start_date: string | null
          team_id: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_event_step: {
        Row: {
          child_care_attributes: Json | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          event_id: number | null
          id: number | null
          is_active: boolean | null
          meal_attributes: Json | null
          notes: string | null
          transportation_attributes: Json | null
          type: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          child_care_attributes?: never
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_id?: number | null
          id?: number | null
          is_active?: boolean | null
          meal_attributes?: never
          notes?: string | null
          transportation_attributes?: never
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          child_care_attributes?: never
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_id?: number | null
          id?: number | null
          is_active?: boolean | null
          meal_attributes?: never
          notes?: string | null
          transportation_attributes?: never
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_step_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event_helper"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event_with_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_type_fkey"
            columns: ["type"]
            referencedRelation: "lookup_step_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_type_fkey"
            columns: ["type"]
            referencedRelation: "vw_lookup_step_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_event_step_request: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          event_id: number | null
          event_step_id: number | null
          id: number | null
          notes: string | null
          profile_id: number | null
          ranking: number | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event_helper"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "vw_event_with_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_event_step_id_fkey"
            columns: ["event_step_id"]
            referencedRelation: "event_step"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_event_step_id_fkey"
            columns: ["event_step_id"]
            referencedRelation: "vw_event_step"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["parent_profile_id"]
          },
          {
            foreignKeyName: "event_step_request_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_status_fkey"
            columns: ["status"]
            referencedRelation: "lookup_invite_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_status_fkey"
            columns: ["status"]
            referencedRelation: "vw_lookup_invite_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_request_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_event_with_steps: {
        Row: {
          description: string | null
          event_steps: Json[] | null
          id: number | null
          is_active: boolean | null
          name: string | null
          start_date: string | null
          team_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "team"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_lookup_address_type: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_address_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_address_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_address_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_address_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_address_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_address_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_lookup_family_member_type: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_family_member_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_family_member_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_family_member_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_family_member_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_family_member_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_family_member_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_lookup_invite_status: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_invite_status_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_invite_status_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_invite_status_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_invite_status_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_invite_status_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_invite_status_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_lookup_pet_type: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_pet_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_pet_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_pet_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_pet_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_pet_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_pet_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_lookup_role: {
        Row: {
          role: Database["public"]["Enums"]["role"] | null
        }
        Relationships: []
      }
      vw_lookup_step_type: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_step_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_step_type_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_step_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_step_type_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_step_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_step_type_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_lookup_transportation_rule: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_transportation_rule_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_transportation_rule_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_transportation_rule_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_transportation_rule_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_transportation_rule_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookup_transportation_rule_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_notification: {
        Row: {
          channel: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          id: number | null
          profile_id: number | null
          proof: string | null
          sent_at: string | null
          sent_by: string | null
          status: string | null
          subject: string | null
          traceback: string | null
        }
        Insert: {
          channel?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: number | null
          profile_id?: number | null
          proof?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string | null
          traceback?: string | null
        }
        Update: {
          channel?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: number | null
          profile_id?: number | null
          proof?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string | null
          traceback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_channel_fkey"
            columns: ["channel"]
            referencedRelation: "lookup_notification_channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_sent_by_fkey"
            columns: ["sent_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_sent_by_fkey"
            columns: ["sent_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_status_fkey"
            columns: ["status"]
            referencedRelation: "lookup_notification_status"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_profile: {
        Row: {
          attributes: Json | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          email_confirmed_at: string | null
          first_name: string | null
          id: number | null
          is_active: boolean | null
          is_email_pending: boolean | null
          is_phone_pending: boolean | null
          last_name: string | null
          phone: string | null
          phone_confirmed_at: string | null
          profile_url: string | null
          roles: Database["public"]["Enums"]["role"][] | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_profile_team: {
        Row: {
          attributes: Json | null
          created_at: string | null
          created_by: string | null
          email: string | null
          email_confirmed_at: string | null
          first_name: string | null
          id: number | null
          is_active: boolean | null
          is_email_pending: boolean | null
          is_phone_pending: boolean | null
          last_name: string | null
          parent_profile_id: number | null
          parent_user_id: string | null
          phone: string | null
          phone_confirmed_at: string | null
          profile_id: number | null
          relationship_attributes: Json | null
          roles: Database["public"]["Enums"]["role"][] | null
          team_id: number | null
          team_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["parent_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["parent_user_id"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "vw_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["parent_profile_id"]
          },
          {
            foreignKeyName: "relationship_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "vw_profile_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationship_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "team"
            referencedColumns: ["id"]
          }
        ]
      }
      vw_user: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string | null
          instance_id: string | null
          invited_at: string | null
          is_sso_user: boolean | null
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string | null
          instance_id?: string | null
          invited_at?: string | null
          is_sso_user?: boolean | null
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string | null
          instance_id?: string | null
          invited_at?: string | null
          is_sso_user?: boolean | null
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_team_relationship_access: {
        Args: {
          _user_id: string
          _team_id: number
        }
        Returns: boolean
      }
      fn_address_deactivate: {
        Args: {
          _id: number
        }
        Returns: undefined
      }
      fn_address_upsert: {
        Args: {
          _city: string
          _description: string
          _profile_id: number
          _state: string
          _street_address_1: string
          _type: string
          _zip: string
          _id?: number
          _location?: unknown
          _street_address_2?: string
        }
        Returns: number
      }
      fn_cron_event_process_post: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      fn_delete_secret: {
        Args: {
          secret_name: string
        }
        Returns: string
      }
      fn_event_deactivate: {
        Args: {
          _event_id: number
        }
        Returns: undefined
      }
      fn_event_processing_deactivate: {
        Args: {
          _event_id: number
        }
        Returns: undefined
      }
      fn_event_processing_insert_if_not_exists: {
        Args: {
          _event_id: number
        }
        Returns: number
      }
      fn_event_processing_update: {
        Args: {
          _event_id: number
          _status: string
        }
        Returns: undefined
      }
      fn_event_step_deactivate: {
        Args: {
          _id: number
        }
        Returns: undefined
      }
      fn_event_step_request_ranking_update: {
        Args: {
          _id: number
          _ranking: number
        }
        Returns: undefined
      }
      fn_event_step_request_upsert: {
        Args: {
          _event_step_id: number
          _notes: string
          _profile_id: number
          _status: string
          _id?: number
        }
        Returns: number
      }
      fn_event_step_upsert: {
        Args: {
          _event_id: number
          _type: string
          _attributes: Json
          _notes?: string
          _parent_step_id?: number
          _id?: number
        }
        Returns: number
      }
      fn_event_upsert: {
        Args: {
          _name: string
          _description: string
          _start_date: string
          _team_id: number
          _id?: number
        }
        Returns: number
      }
      fn_get_authenticated_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      fn_get_team_by_client_user_id: {
        Args: {
          _user_id: string
        }
        Returns: {
          attributes: Json | null
          created_at: string | null
          created_by: string | null
          email: string | null
          email_confirmed_at: string | null
          first_name: string | null
          id: number | null
          is_active: boolean | null
          is_email_pending: boolean | null
          is_phone_pending: boolean | null
          last_name: string | null
          parent_profile_id: number | null
          parent_user_id: string | null
          phone: string | null
          phone_confirmed_at: string | null
          profile_id: number | null
          relationship_attributes: Json | null
          roles: Database["public"]["Enums"]["role"][] | null
          team_id: number | null
          team_name: string | null
          user_id: string | null
        }[]
      }
      fn_insert_secret: {
        Args: {
          name: string
          secret: string
        }
        Returns: string
      }
      fn_notification_insert: {
        Args: {
          _profile_id: number
          _subject: string
          _content: string
          _channel: string
          _traceback: string
        }
        Returns: number
      }
      fn_notification_update: {
        Args: {
          _notification_id: number
          _status: string
          _proof?: string
        }
        Returns: undefined
      }
      fn_profile_and_relationship_upsert: {
        Args: {
          _user_id?: string
          _parent_profile_id?: number
          _id?: number
          _profile_attributes?: Json
          _relationship_attributes?: Json
          _first_name?: string
          _last_name?: string
          _profile_url?: string
          _roles?: Database["public"]["Enums"]["role"][]
          _team_id?: number
        }
        Returns: number
      }
      fn_profile_location_upsert: {
        Args: {
          _profile_id: number
          _location: unknown
        }
        Returns: undefined
      }
      fn_read_secret: {
        Args: {
          secret_name: string
        }
        Returns: string
      }
      fn_relationship_deactivate: {
        Args: {
          _profile_id: number
        }
        Returns: undefined
      }
      fn_rls_event_step_insert_update_policy: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      fn_rls_policy_event_step: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      fn_rls_policy_event_step_request: {
        Args: {
          _event_step_id: number
        }
        Returns: boolean
      }
      fn_rls_policy_is_owner_or_has_special_access: {
        Args: {
          requested_profile_id: number
        }
        Returns: boolean
      }
      fn_rls_policy_is_profile_accessible: {
        Args: {
          profile_id_to_check: number
        }
        Returns: boolean
      }
      fn_rls_policy_is_subitem_accessible: {
        Args: {
          _requested_profile_id: number
        }
        Returns: boolean
      }
      fn_seed_create_user: {
        Args: {
          email: string
          password: string
        }
        Returns: string
      }
      fn_team_upsert: {
        Args: {
          _name: string
          _id?: number
        }
        Returns: number
      }
    }
    Enums: {
      role:
        | "ADMIN"
        | "FAMILY_MEMBER"
        | "HELPER"
        | "CLIENT"
        | "PET"
        | "TEAM_ADMIN"
        | "TEAM_OWNER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
