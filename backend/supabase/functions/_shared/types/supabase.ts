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
          created_by: number
          deleted_at: string | null
          deleted_by: number
          id: number
          location: unknown | null
          profile_id: number | null
          state: string
          street_address_1: string
          street_address_2: string | null
          updated_at: string | null
          updated_by: number
          zip: string
        }
        Insert: {
          city: string
          created_at?: string
          created_by: number
          deleted_at?: string | null
          deleted_by: number
          id?: number
          location?: unknown | null
          profile_id?: number | null
          state: string
          street_address_1: string
          street_address_2?: string | null
          updated_at?: string | null
          updated_by: number
          zip: string
        }
        Update: {
          city?: string
          created_at?: string
          created_by?: number
          deleted_at?: string | null
          deleted_by?: number
          id?: number
          location?: unknown | null
          profile_id?: number | null
          state?: string
          street_address_1?: string
          street_address_2?: string | null
          updated_at?: string | null
          updated_by?: number
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_profile"
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
            foreignKeyName: "address_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          }
        ]
      }
      event: {
        Row: {
          created_at: string
          created_by: number
          deleted_at: string | null
          deleted_by: number
          description: string | null
          end_date: string | null
          id: number
          name: string
          patient_profile_id: number | null
          start_date: string | null
          updated_at: string | null
          updated_by: number
        }
        Insert: {
          created_at?: string
          created_by: number
          deleted_at?: string | null
          deleted_by: number
          description?: string | null
          end_date?: string | null
          id?: number
          name: string
          patient_profile_id?: number | null
          start_date?: string | null
          updated_at?: string | null
          updated_by: number
        }
        Update: {
          created_at?: string
          created_by?: number
          deleted_at?: string | null
          deleted_by?: number
          description?: string | null
          end_date?: string | null
          id?: number
          name?: string
          patient_profile_id?: number | null
          start_date?: string | null
          updated_at?: string | null
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          }
        ]
      }
      event_step: {
        Row: {
          created_at: string
          created_by: number
          deleted_at: string | null
          deleted_by: number
          event_id: number
          id: number
          type: Database["public"]["Enums"]["step_type"]
          updated_at: string | null
          updated_by: number
        }
        Insert: {
          created_at?: string
          created_by: number
          deleted_at?: string | null
          deleted_by: number
          event_id: number
          id?: number
          type: Database["public"]["Enums"]["step_type"]
          updated_at?: string | null
          updated_by: number
        }
        Update: {
          created_at?: string
          created_by?: number
          deleted_at?: string | null
          deleted_by?: number
          event_id?: number
          id?: number
          type?: Database["public"]["Enums"]["step_type"]
          updated_at?: string | null
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_step_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          }
        ]
      }
      event_step_invite: {
        Row: {
          created_at: string
          created_by: number
          deleted_at: string | null
          deleted_by: number
          event_step_id: number
          id: number
          is_primary: boolean
          status: Database["public"]["Enums"]["invite_status"]
          updated_at: string | null
          updated_by: number
        }
        Insert: {
          created_at?: string
          created_by: number
          deleted_at?: string | null
          deleted_by: number
          event_step_id: number
          id?: number
          is_primary?: boolean
          status?: Database["public"]["Enums"]["invite_status"]
          updated_at?: string | null
          updated_by: number
        }
        Update: {
          created_at?: string
          created_by?: number
          deleted_at?: string | null
          deleted_by?: number
          event_step_id?: number
          id?: number
          is_primary?: boolean
          status?: Database["public"]["Enums"]["invite_status"]
          updated_at?: string | null
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_step_invite_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_invite_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_invite_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_invite_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_invite_event_step_id_fkey"
            columns: ["event_step_id"]
            referencedRelation: "event_step"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_invite_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_step_invite_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_relation: {
        Row: {
          accepted_at: string | null
          accepted_by: number
          code: string | null
          created_at: string
          created_by: number
          deleted_at: string | null
          deleted_by: number
          helper_profile_id: number | null
          id: number
          patient_profile_id: number | null
          request_types: Database["public"]["Enums"]["step_type"][] | null
          response_types: Database["public"]["Enums"]["step_type"][] | null
          status: Database["public"]["Enums"]["invite_status"]
          updated_at: string | null
          updated_by: number
        }
        Insert: {
          accepted_at?: string | null
          accepted_by: number
          code?: string | null
          created_at?: string
          created_by: number
          deleted_at?: string | null
          deleted_by: number
          helper_profile_id?: number | null
          id?: number
          patient_profile_id?: number | null
          request_types?: Database["public"]["Enums"]["step_type"][] | null
          response_types?: Database["public"]["Enums"]["step_type"][] | null
          status?: Database["public"]["Enums"]["invite_status"]
          updated_at?: string | null
          updated_by: number
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: number
          code?: string | null
          created_at?: string
          created_by?: number
          deleted_at?: string | null
          deleted_by?: number
          helper_profile_id?: number | null
          id?: number
          patient_profile_id?: number | null
          request_types?: Database["public"]["Enums"]["step_type"][] | null
          response_types?: Database["public"]["Enums"]["step_type"][] | null
          status?: Database["public"]["Enums"]["invite_status"]
          updated_at?: string | null
          updated_by?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_relation_accepted_by_fkey"
            columns: ["accepted_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_accepted_by_fkey"
            columns: ["accepted_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_helper_profile_id_fkey"
            columns: ["helper_profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_helper_profile_id_fkey"
            columns: ["helper_profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relation_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          }
        ]
      }
      profile: {
        Row: {
          created_at: string
          created_by: number
          date_of_birth: string | null
          deleted_at: string | null
          deleted_by: number
          first_name: string | null
          id: number
          is_active: boolean
          last_name: string | null
          parent_profile_id: number | null
          profile_url: string | null
          roles: Database["public"]["Enums"]["role"][] | null
          updated_at: string | null
          updated_by: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: number
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by: number
          first_name?: string | null
          id?: number
          is_active?: boolean
          last_name?: string | null
          parent_profile_id?: number | null
          profile_url?: string | null
          roles?: Database["public"]["Enums"]["role"][] | null
          updated_at?: string | null
          updated_by: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: number
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: number
          first_name?: string | null
          id?: number
          is_active?: boolean
          last_name?: string | null
          parent_profile_id?: number | null
          profile_url?: string | null
          roles?: Database["public"]["Enums"]["role"][] | null
          updated_at?: string | null
          updated_by?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      vw_profile: {
        Row: {
          created_at: string | null
          created_by: number | null
          date_of_birth: string | null
          deleted_at: string | null
          deleted_by: number | null
          email: string | null
          first_name: string | null
          id: number | null
          is_active: boolean | null
          last_name: string | null
          parent_profile_id: number | null
          phone: string | null
          profile_url: string | null
          updated_at: string | null
          updated_by: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_deleted_by_fkey"
            columns: ["deleted_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "vw_profile"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_step_status: "ACCEPTED" | "DECLINED" | "INVITED"
      invite_status: "ACCEPTED" | "DECLINED" | "INVITED"
      role: "ADMIN" | "CHILD" | "HELPER" | "PATIENT"
      step_type: "ACCOMPANY" | "CHILD_CARE" | "COOK" | "DRIVE" | "LODGE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

